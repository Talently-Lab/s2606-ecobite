import { Map as LeafletMap } from 'leaflet'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import type { HomeData } from '../types'
import { HomePage } from './HomePage'

const fetchMock = vi.fn<typeof fetch>()
const restaurant = {
  id: 1,
  name: 'Verde Bowl',
  address: 'Av. Verde 123',
  biodegradablePackaging: true,
  ecoIndicator: 'Reparto sustentable',
  latitude: -34.6037,
  longitude: -58.3816,
}
const restaurantWithoutCoordinates = {
  ...restaurant,
  id: 2,
  name: 'Local sin coordenadas',
  latitude: undefined,
  longitude: undefined,
}
const data: HomeData = {
  userImpact: null,
  categories: [
    { id: 1, name: 'Bowls', slug: 'bowls' },
    { id: 2, name: 'Wraps', slug: 'wraps' },
  ],
  restaurants: [restaurant],
  featuredDishes: [
    { id: 1, name: 'Bowl de quinoa', price: 8500, co2SavedPerUnit: 0.4, category: 'Bowls', restaurant },
    { id: 2, name: 'Wrap de vegetales', price: 7000, co2SavedPerUnit: 0.3, category: 'Wraps', restaurant },
  ],
  howItWorks: [
    {
      step: 1,
      title: 'Elige tu comida',
      description: 'Descubre restaurantes y platillos disponibles en EcoBite.',
    },
  ],
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

function CurrentLocation() {
  const location = useLocation()
  return (
    <span aria-label="Ruta actual">
      {location.pathname}
      {location.search}
    </span>
  )
}

function renderHome() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
        <CurrentLocation />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function authenticate() {
  localStorage.setItem('ecobite.token', 'jwt-valido')
  fetchMock.mockResolvedValueOnce(
    response({
      message: 'Usuario autenticado',
      user: {
        id_usuario: 1,
        nombre: 'Ana Pérez',
        email: 'ana@example.com',
        rol: 'cliente',
        fecha_registro: '2026-10-25T15:40:26.684Z',
      },
    }),
  )
}

beforeEach(() => {
  // Leaflet needs layout geometry; jsdom does not calculate CSS dimensions.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800)
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(1200)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(800)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 1200,
    bottom: 800,
    width: 1200,
    height: 800,
    toJSON: () => ({}),
  })
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('HomePage', () => {
  it('espera los datos y muestra el mapa ya encuadrado con sus marcadores, sin una ubicación provisional', async () => {
    let resolveHome!: (response: Response) => void
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveHome = resolve
        }),
    )
    const fitBounds = vi.spyOn(LeafletMap.prototype, 'fitBounds')
    const { container } = renderHome()
    expect(container.querySelector('.leaflet-container')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando restaurantes')
    expect(fitBounds).not.toHaveBeenCalled()
    await act(async () =>
      resolveHome(
        response({
          data: { ...data, restaurants: [{ ...restaurant, latitude: -12.0464, longitude: -77.0428 }] },
        }),
      ),
    )
    expect(await screen.findByRole('button', { name: 'Información de Verde Bowl' })).toBeInTheDocument()
    expect(fitBounds.mock.calls[0]?.[0]).toEqual([[-12.0464, -77.0428]])
    expect(container.querySelector('.map-scene')).toHaveClass('is-prepared')
    expect(container.querySelector('.map-scene')).toHaveAttribute('aria-hidden', 'false')
    expect(screen.queryByText('Preparando mapa…')).not.toBeInTheDocument()
  })

  it('no vuelve a encuadrar por notificaciones de tamaño repetidas y limpia el observador al salir', async () => {
    let resize = () => {}
    const disconnect = vi.fn()
    let width = 1200
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width)
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback
        }
        observe() {}
        disconnect = disconnect
      },
    )
    fetchMock.mockResolvedValue(response({ data }))
    const fitBounds = vi.spyOn(LeafletMap.prototype, 'fitBounds')
    const { unmount } = renderHome()
    await screen.findByRole('button', { name: 'Información de Verde Bowl' })
    const initialFits = fitBounds.mock.calls.length
    act(() => resize())
    act(() => resize())
    expect(fitBounds).toHaveBeenCalledTimes(initialFits)
    width = 900
    act(() => resize())
    expect(fitBounds).toHaveBeenCalledTimes(initialFits + 1)
    unmount()
    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('ofrece un CTA al catálogo y navegación móvil con estado expandido', async () => {
    fetchMock.mockResolvedValue(response({ message: 'OK', data }))
    const user = userEvent.setup()
    renderHome()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Encontrá dónde comer.')
    expect(screen.queryByRole('link', { name: /Explorar restaurantes/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Ver restaurantes' })).toHaveAttribute('href', '/restaurantes')
    expect(screen.getByRole('link', { name: 'Explorar el mapa' })).toHaveAttribute('href', '#mapa')
    expect(
      screen.getByText(
        'Elegí restaurantes con delivery sustentable y conocé el CO₂ estimado que evitás con cada pedido.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('UN POCO MÁS RICO. UN POCO MÁS CONSCIENTE.')).not.toBeInTheDocument()
    expect(screen.queryByText('Bici o eléctrico')).not.toBeInTheDocument()
    expect(screen.queryByText('Envases conscientes')).not.toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: 'Abrir navegación' })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Cerrar navegación' })).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('link', { name: 'Restaurantes' }))
    expect(screen.getByRole('button', { name: 'Abrir navegación' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('consulta las ubicaciones reales sin mostrar tarjetas, platos ni categorías', async () => {
    fetchMock.mockResolvedValue(response({ message: 'OK', data }))
    renderHome()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando restaurantes')
    expect(await screen.findByRole('button', { name: 'Información de Verde Bowl' })).toBeInTheDocument()
    expect(screen.getByText('1 local ubicado en el mapa')).toBeInTheDocument()
    expect(screen.getByLabelText('Mapa de restaurantes')).toBeInTheDocument()
    expect(screen.queryByText('Bowl de quinoa')).not.toBeInTheDocument()
    expect(screen.queryByText(restaurant.address)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Bowls' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Verde Bowl' })).not.toBeInTheDocument()
    expect(screen.getByText(data.howItWorks[0]!.description)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar el mapa' })).toHaveAttribute('href', '#mapa')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/home', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
  })

  it('excluye coordenadas ausentes, no finitas o fuera de rango', async () => {
    fetchMock.mockResolvedValue(
      response({
        data: {
          ...data,
          restaurants: [
            restaurant,
            restaurantWithoutCoordinates,
            { ...restaurant, id: 3, name: 'Local fuera de rango', latitude: 91 },
            { ...restaurant, id: 4, name: 'Local inválido', longitude: 'no disponible' },
          ],
        },
      }),
    )
    renderHome()
    expect(await screen.findByRole('button', { name: 'Información de Verde Bowl' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Información de Local/ })).not.toBeInTheDocument()
    expect(screen.getByText('1 local ubicado en el mapa')).toBeInTheDocument()
  })

  it('abre información en el mapa y navega solo al pulsar Ver más', async () => {
    fetchMock.mockResolvedValue(response({ data }))
    renderHome()
    fireEvent.click(await screen.findByRole('button', { name: 'Información de Verde Bowl' }), {
      clientX: 600,
      clientY: 400,
    })
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/')
    expect(screen.getByText(restaurant.address)).toBeInTheDocument()
    expect(screen.getByText(`Indicador ecológico: ${restaurant.ecoIndicator}`)).toBeInTheDocument()
    expect(screen.getByText('Envase biodegradable')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: 'Ver más de Verde Bowl' }))
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/restaurantes?restaurante=1')
  })

  it('permite activar el marcador con Enter', async () => {
    fetchMock.mockResolvedValue(response({ data }))
    const user = userEvent.setup()
    renderHome()
    const marker = await screen.findByRole('button', { name: 'Información de Verde Bowl' })
    act(() => marker.focus())
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/')
    expect(screen.getByRole('link', { name: 'Ver más de Verde Bowl' })).toBeInTheDocument()
    expect(screen.getByText(restaurant.address)).toBeInTheDocument()
  })

  it('envía el JWT al cargar las ubicaciones para una sesión activa', async () => {
    authenticate()
    fetchMock.mockResolvedValue(
      response({
        message: 'Datos obtenidos correctamente',
        data: {
          ...data,
          userImpact: { co2SavedKg: 0 },
        },
      }),
    )
    renderHome()
    expect(await screen.findByLabelText('Mapa de restaurantes')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Información de Verde Bowl' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/home',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-valido' }),
      }),
    )
  })

  it('actualiza Home sin autenticación al cerrar sesión', async () => {
    authenticate()
    fetchMock.mockResolvedValueOnce(
      response({
        message: 'Datos obtenidos correctamente',
        data: {
          ...data,
          userImpact: { co2SavedKg: 2.5 },
        },
      }),
    )
    fetchMock.mockResolvedValue(response({ message: 'Datos obtenidos correctamente', data }))
    const user = userEvent.setup()
    renderHome()
    expect(await screen.findByLabelText('Mapa de restaurantes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mi cuenta' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('button', { name: 'Información de Verde Bowl' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenLastCalledWith('http://localhost:3000/api/home', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
  })

  it('muestra el error 401 de Home sin confundirlo con un catálogo vacío', async () => {
    authenticate()
    fetchMock.mockResolvedValue(
      response(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token inválido',
            fields: {},
          },
        },
        401,
      ),
    )
    renderHome()
    expect(await screen.findByRole('alert')).toHaveTextContent('Token inválido')
    expect(screen.queryByText('Todavía no hay locales disponibles.')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('muestra el estado vacío cuando la API devuelve listas vacías', async () => {
    fetchMock.mockResolvedValue(
      response({
        message: 'Datos obtenidos correctamente',
        data: {
          userImpact: null,
          categories: [],
          restaurants: [],
          featuredDishes: [],
          howItWorks: [],
        },
      }),
    )
    renderHome()
    expect(
      await screen.findByText('Todavía no hay restaurantes con ubicación disponible.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos los restaurantes' })).toHaveAttribute(
      'href',
      '/restaurantes',
    )
  })

  it('muestra los errores de conexión', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    renderHome()
    expect(within(await screen.findByRole('alert')).getByText(/No pudimos conectarnos/)).toBeInTheDocument()
  })
})
