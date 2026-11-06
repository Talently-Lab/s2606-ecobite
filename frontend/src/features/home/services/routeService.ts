export const CAR_EMISSIONS_GRAMS_PER_KM = 180
export const BIKE_EMISSIONS_GRAMS_PER_KM = 0

export interface Coordinates {
  latitude: number
  longitude: number
}

export class LocationError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message)
  }
}

export interface RouteResult {
  distanceKm: number
  durationMinutes: number
  coordinates: [number, number][]
}

interface OsrmResponse {
  code?: string
  routes?: Array<{
    distance?: number
    duration?: number
    geometry?: {
      coordinates?: unknown
    }
  }>
}

export function calculateEstimatedBikeSavings(distanceKm: number) {
  return (distanceKm * (CAR_EMISSIONS_GRAMS_PER_KM - BIKE_EMISSIONS_GRAMS_PER_KM)) / 1000
}

export function requestCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (window.isSecureContext === false) {
      reject(
        new Error(
          'Para usar tu ubicación, abrí Ecobite mediante HTTPS o localhost. También podés elegir un punto en el mapa.',
        ),
      )
      return
    }
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no permite obtener tu ubicación.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(coords),
      (error) =>
        reject(
          new LocationError(
            error.code,
            error.code === 1
              ? 'El acceso a tu ubicación está bloqueado. Revisá los permisos del sitio o elegí un punto en el mapa.'
              : error.code === 3
                ? 'La ubicación tardó demasiado. Intentá de nuevo o elegí un punto en el mapa.'
                : 'Tu ubicación no está disponible. Comprobá la ubicación del dispositivo o elegí un punto.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  })
}

function isCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    Number.isFinite(value[0]) &&
    Math.abs(value[0]) <= 180 &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[1]) &&
    Math.abs(value[1]) <= 90
  )
}

export async function fetchRoute(
  origin: Coordinates,
  destination: Coordinates,
  signal?: AbortSignal,
): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('No pudimos calcular la ruta hasta el restaurante.')

  const payload = (await response.json()) as OsrmResponse
  const route = payload.routes?.[0]
  const coordinates = route?.geometry?.coordinates
  if (
    payload.code !== 'Ok' ||
    typeof route?.distance !== 'number' ||
    !Number.isFinite(route.distance) ||
    route.distance < 0 ||
    typeof route.duration !== 'number' ||
    !Number.isFinite(route.duration) ||
    route.duration < 0 ||
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    !coordinates.every(isCoordinatePair)
  ) {
    throw new Error('La ruta recibida no es válida.')
  }

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
    coordinates: coordinates.map(([longitude, latitude]) => [latitude, longitude]),
  }
}
