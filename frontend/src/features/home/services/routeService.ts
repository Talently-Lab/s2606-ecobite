import { request } from '@/shared/lib/http'
import type { DeliveryDestination } from '@/shared/lib/orderDraft'
export interface Coordinates {
  latitude: number
  longitude: number
}
export interface RouteResult {
  distanceKm: number
  co2SavedKg: number
  coordinates: [number, number][]
  methodology: string
}
export class LocationError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message)
  }
}
export function requestCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (window.isSecureContext === false) {
      reject(
        new Error(
          'Para usar tu ubicación, abrí Ecobite mediante HTTPS o localhost. También podés buscar una dirección.',
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
              ? 'El acceso a tu ubicación está bloqueado. Revisá los permisos del sitio o buscá una dirección.'
              : error.code === 3
                ? 'La ubicación tardó demasiado. Intentá de nuevo o buscá una dirección.'
                : 'Tu ubicación no está disponible. Comprobá la ubicación del dispositivo o buscá una dirección.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  })
}

export async function fetchRoute(
  restaurantId: number,
  destination: DeliveryDestination,
): Promise<RouteResult> {
  const { data } = await request<{ data: RouteResult }>('/delivery/estimate', {
    method: 'POST',
    body: { restaurantId, destination },
  })
  return data
}
