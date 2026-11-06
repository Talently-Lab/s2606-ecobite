import { afterEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn<typeof fetch>()

async function service(baseUrl: string) {
  vi.stubEnv('VITE_IMAGES_BASE_URL', baseUrl)
  vi.stubGlobal('fetch', fetchMock)
  vi.resetModules()
  return (await import('./catalogService')).catalogService
}

function respond(data: unknown) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: 'OK', data })))
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('imágenes del catálogo', () => {
  it('completa fotos de restaurantes con CloudFront y respeta las URLs de la API', async () => {
    const catalog = await service('https://images.example.com/')
    respond([
      { id: 1, imageUrl: null },
      { id: 2, imageUrl: 'https://api.example.com/local.jpg' },
    ])
    const { data } = await catalog.list('', '')
    expect(data.map((restaurant) => restaurant.imageUrl)).toEqual([
      'https://images.example.com/restaurants/1.jpg',
      'https://api.example.com/local.jpg',
    ])
  })

  it('completa fotos del restaurante y sus platos al consultar el menú', async () => {
    const catalog = await service('https://images.example.com')
    respond({
      restaurant: { id: 1, imageUrl: null },
      dishes: [
        { id: 16, imageUrl: null },
        { id: 17, imageUrl: 'https://api.example.com/plato.jpg' },
      ],
    })
    const { data } = await catalog.menu(1)
    expect(data.restaurant.imageUrl).toBe('https://images.example.com/restaurants/1.jpg')
    expect(data.dishes.map((dish) => dish.imageUrl)).toEqual([
      'https://images.example.com/dishes/16.jpg',
      'https://api.example.com/plato.jpg',
    ])
  })

  it('conserva el estado sin fotografía cuando no hay una base configurada', async () => {
    const catalog = await service('')
    respond([{ id: 1, imageUrl: null }])
    expect((await catalog.list('', '')).data[0]?.imageUrl).toBeNull()
  })
})
