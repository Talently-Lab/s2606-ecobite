import { afterEach, expect, it, vi } from 'vitest'
import { request } from './http'

afterEach(() => vi.unstubAllGlobals())

it.each(['/delivery/estimate', '/delivery/addresses?q=Belgrano'])(
  'explica que el servicio no está disponible cuando %s devuelve un 404 HTML',
  async (path) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<pre>Cannot find endpoint</pre>', { status: 404 })),
    )
    await expect(request(path)).rejects.toMatchObject({
      status: 404,
      message: 'El servicio de ubicación y recorridos no está disponible. Intentá más tarde.',
    })
  },
)

it('conserva el error del backend cuando el restaurante no está disponible', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: 'El restaurante no está disponible.' }), { status: 404 }),
      ),
  )
  await expect(request('/delivery/estimate')).rejects.toThrow('El restaurante no está disponible.')
})

it.each([false, true])(
  'interrumpe una cotización que supera el tiempo de espera (leyendo respuesta: %s)',
  async (readingBody) => {
    const controller = new AbortController()
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, options: RequestInit) => {
        const pending = new Promise((_resolve, reject) => {
          expect(options.signal).toBe(controller.signal)
          options.signal!.addEventListener('abort', () => reject(new DOMException('Timeout', 'AbortError')))
        })
        return readingBody ? Promise.resolve({ json: () => pending }) : pending
      }),
    )
    const pending = request('/checkout/cotizar', { method: 'POST', signal: controller.signal })
    controller.abort()
    await expect(pending).rejects.toThrow(
      'El cálculo de entrega tardó demasiado. Reintentá o cambiá el destino.',
    )
  },
)
