import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRoute, requestCurrentPosition } from './routeService'
afterEach(() => vi.unstubAllGlobals())
describe('recorrido desde la API', () => {
  it('usa el restaurante y destino y conserva el cálculo del backend', async () => {
    const route = {
      distanceKm: 2.5,
      co2SavedKg: 0.43,
      methodology: 'transport-170g-v1',
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: route })))
    vi.stubGlobal('fetch', fetchMock)
    const destination = { latitude: 1, longitude: 1, label: 'Destino elegido' }
    await expect(fetchRoute(1, destination)).resolves.toEqual(route)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/delivery/estimate'),
      expect.objectContaining({ body: JSON.stringify({ restaurantId: 1, destination }) }),
    )
  })
  it('expone errores recuperables del backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ message: 'No hay recorrido' }), { status: 502 })),
    )
    await expect(fetchRoute(1, { latitude: 0, longitude: 0, label: 'Destino' })).rejects.toThrow(
      'No hay recorrido',
    )
  })
  it('rechaza navegadores sin geolocalización', async () => {
    vi.stubGlobal('navigator', {})
    await expect(requestCurrentPosition()).rejects.toThrow('no permite obtener tu ubicación')
  })
  it.each([
    [1, 'bloqueado'],
    [2, 'no está disponible'],
    [3, 'tardó demasiado'],
  ])('explica el error GPS %i', async (code, message) => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_ok: unknown, fail: (error: { code: number }) => void) => fail({ code }),
      },
    })
    await expect(requestCurrentPosition()).rejects.toThrow(message)
  })
})
