import { afterEach, expect, it, vi } from 'vitest'
import { request } from './http'

afterEach(() => vi.unstubAllGlobals())

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
