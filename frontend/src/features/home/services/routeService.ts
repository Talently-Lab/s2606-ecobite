export const CAR_EMISSIONS_GRAMS_PER_KM = 180
export const BIKE_EMISSIONS_GRAMS_PER_KM = 0

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
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no permite obtener tu ubicación.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(coords),
      () => reject(new Error('No pudimos obtener tu ubicación. Revisá el permiso e intentá de nuevo.')),
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
    typeof value[1] === 'number' &&
    Number.isFinite(value[1])
  )
}

export async function fetchRoute(
  origin: GeolocationCoordinates,
  destination: { latitude: number; longitude: number },
): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
  const response = await fetch(url)
  if (!response.ok) throw new Error('No pudimos calcular la ruta hasta el restaurante.')

  const payload = (await response.json()) as OsrmResponse
  const route = payload.routes?.[0]
  const coordinates = route?.geometry?.coordinates
  if (
    payload.code !== 'Ok' ||
    typeof route?.distance !== 'number' ||
    !Number.isFinite(route.distance) ||
    typeof route.duration !== 'number' ||
    !Number.isFinite(route.duration) ||
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
