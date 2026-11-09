import prisma from "../config/db";

export interface DeliveryDestination {
  latitude: number;
  longitude: number;
  label: string;
}
export const DELIVERY_METHODOLOGY = "transport-170g-v1";
export class DeliveryError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function validateDestination(value: unknown): DeliveryDestination {
  const point = value as DeliveryDestination | null;
  if (
    !point ||
    typeof point.latitude !== "number" ||
    !Number.isFinite(point.latitude) ||
    Math.abs(point.latitude) > 90 ||
    typeof point.longitude !== "number" ||
    !Number.isFinite(point.longitude) ||
    Math.abs(point.longitude) > 180 ||
    typeof point.label !== "string" ||
    !point.label.trim() ||
    point.label.length > 500
  ) {
    throw new DeliveryError(
      400,
      "INVALID_DESTINATION",
      "Seleccioná un destino de entrega válido.",
    );
  }
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    label: point.label.trim(),
  };
}
// Integer arithmetic matches PostgreSQL numeric round for nonnegative distances.
export function transportImpact(meters: number) {
  if (!Number.isFinite(meters) || meters < 0 || meters > 999_999_990)
    throw new DeliveryError(
      502,
      "INVALID_ROUTE",
      "La distancia recibida no es válida.",
    );
  const hundredths = Math.round(meters / 10);
  return {
    distanceKm: hundredths / 100,
    co2SavedKg: Math.round((hundredths * 17) / 100) / 100,
  };
}
async function providerJson(url: URL, provider: string) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("provider status");
    return await response.json();
  } catch {
    console.error("Delivery provider failure", { provider });
    throw new DeliveryError(
      503,
      "DELIVERY_PROVIDER_UNAVAILABLE",
      provider === "osrm"
        ? "No pudimos calcular el recorrido de entrega. Tu destino se conserva. Intentá nuevamente."
        : "La búsqueda de direcciones no está disponible. Intentá nuevamente o usá tu ubicación.",
    );
  }
}
export async function searchAddresses(
  query: unknown,
): Promise<DeliveryDestination[]> {
  if (
    typeof query !== "string" ||
    query.trim().length < 3 ||
    query.length > 200
  )
    throw new DeliveryError(
      400,
      "INVALID_SEARCH",
      "Ingresá una dirección de entre 3 y 200 caracteres.",
    );
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key)
    throw new DeliveryError(
      503,
      "GEOCODING_NOT_CONFIGURED",
      "La búsqueda de direcciones aún no está disponible. Podés usar tu ubicación.",
    );
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.search = new URLSearchParams({
    text: query.trim(),
    format: "json",
    lang: "es",
    limit: "5",
    apiKey: key,
  }).toString();
  const payload = await providerJson(url, "geoapify");
  try {
    if (!Array.isArray(payload?.results) || payload?.results.length > 5)
      throw new Error("invalid results");
    return payload?.results.map(
      (item: { lat: unknown; lon: unknown; formatted: unknown }) =>
        validateDestination({
          latitude: item.lat,
          longitude: item.lon,
          label: item.formatted,
        }),
    );
  } catch {
    console.error("Invalid delivery provider response", {
      provider: "geoapify",
    });
    throw new DeliveryError(
      502,
      "INVALID_ADDRESSES",
      "La búsqueda devolvió una respuesta inválida. Intentá nuevamente.",
    );
  }
}
export async function estimateDelivery(restaurantId: unknown, value: unknown) {
  const destination = validateDestination(value);
  if (
    typeof restaurantId !== "number" ||
    !Number.isSafeInteger(restaurantId) ||
    restaurantId <= 0
  )
    throw new DeliveryError(
      400,
      "INVALID_RESTAURANT_ID",
      "Seleccioná un restaurante válido.",
    );
  const restaurant = await prisma.restaurantes.findFirst({
    where: { id_restaurante: restaurantId, activo: true },
    select: { latitud: true, longitud: true },
  });
  if (!restaurant)
    throw new DeliveryError(
      404,
      "RESTAURANT_NOT_AVAILABLE",
      "El restaurante no está disponible.",
    );
  if (restaurant.latitud === null || restaurant.longitud === null)
    throw new DeliveryError(
      422,
      "RESTAURANT_LOCATION_MISSING",
      "El restaurante todavía no tiene ubicación para calcular el recorrido.",
    );
  const latitude = Number(restaurant.latitud),
    longitude = Number(restaurant.longitud);
  if (
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  )
    throw new DeliveryError(
      422,
      "INVALID_RESTAURANT_LOCATION",
      "La ubicación del restaurante no es válida.",
    );
  if (
    latitude === destination.latitude &&
    longitude === destination.longitude
  ) {
    return {
      ...transportImpact(0),
      coordinates: [
        [latitude, longitude],
        [latitude, longitude],
      ],
      methodology: DELIVERY_METHODOLOGY,
      destination,
    };
  }
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${destination.longitude},${destination.latitude}`,
  );
  url.search = "overview=full&geometries=geojson";
  const payload = await providerJson(url, "osrm");
  const route = payload?.routes?.[0];
  const coordinates = route?.geometry?.coordinates;
  if (
    payload?.code !== "Ok" ||
    typeof route?.distance !== "number" ||
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    !coordinates.every(
      (p: unknown) =>
        Array.isArray(p) &&
        p.length === 2 &&
        typeof p[0] === "number" &&
        Number.isFinite(p[0]) &&
        Math.abs(p[0]) <= 180 &&
        typeof p[1] === "number" &&
        Number.isFinite(p[1]) &&
        Math.abs(p[1]) <= 90,
    )
  ) {
    console.error("Invalid delivery provider response", { provider: "osrm" });
    throw new DeliveryError(
      502,
      "NO_ROUTE",
      "No encontramos un recorrido por calles hasta ese destino. Revisá la dirección o reintentá.",
    );
  }
  return {
    ...transportImpact(route.distance),
    coordinates: coordinates.map(([lon, lat]: number[]) => [lat, lon]),
    methodology: DELIVERY_METHODOLOGY,
    destination,
  };
}
