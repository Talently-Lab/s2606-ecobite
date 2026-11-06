import { describe, expect, it, vi } from 'vitest'
import { calculateEstimatedBikeSavings, fetchRoute, requestCurrentPosition } from './routeService'

const origin = {
  latitude: -34.61,
  longitude: -58.41,
  accuracy: 10,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
  toJSON: () => ({}),
}

describe('routeService', () => {
  it('calcula el ahorro provisional de bici frente a auto', () => {
    expect(calculateEstimatedBikeSavings(10)).toBe(1.8)
  })

  it('convierte la geometría GeoJSON de OSRM a coordenadas Leaflet', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: 'Ok',
            routes: [
              {
                distance: 2500,
                duration: 600,
                geometry: {
                  coordinates: [
                    [-58.4, -34.6],
                    [-58.39, -34.59],
                  ],
                },
              },
            ],
          }),
        ),
      ),
    )

    await expect(fetchRoute(origin, { latitude: -34.59, longitude: -58.39 })).resolves.toEqual({
      distanceKm: 2.5,
      durationMinutes: 10,
      coordinates: [
        [-34.6, -58.4],
        [-34.59, -58.39],
      ],
    })
  })

  it('rechaza una respuesta de ruta inválida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'NoRoute' }))))
    await expect(fetchRoute(origin, { latitude: -34.59, longitude: -58.39 })).rejects.toThrow(
      'La ruta recibida no es válida.',
    )
  })

  it('rechaza cuando el navegador no ofrece geolocalización', async () => {
    vi.stubGlobal('navigator', {})
    await expect(requestCurrentPosition()).rejects.toThrow('no permite obtener tu ubicación')
  })
})

describe('ubicación y distancia', () => {
  it.each([
    [1, 'bloqueado'],
    [2, 'no está disponible'],
    [3, 'tardó demasiado'],
  ])('distingue el error de geolocalización %i', async (code, message) => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_success: unknown, failure: (error: { code: number }) => void) =>
          failure({ code }),
      },
    })
    await expect(requestCurrentPosition()).rejects.toThrow(message)
  })

  it('envía la señal de cancelación al servicio externo', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn().mockRejectedValue(new Error('cancelled'))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchRoute(origin, origin, controller.signal)).rejects.toThrow('cancelled')
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('route/v1/driving/'), {
      signal: controller.signal,
    })
  })

  it('rechaza distancias negativas y no las convierte en ahorro', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: 'Ok',
            routes: [
              {
                distance: -1,
                duration: 10,
                geometry: {
                  coordinates: [
                    [0, 0],
                    [1, 1],
                  ],
                },
              },
            ],
          }),
        ),
      ),
    )
    await expect(fetchRoute(origin, origin)).rejects.toThrow('La ruta recibida no es válida.')
  })
})
