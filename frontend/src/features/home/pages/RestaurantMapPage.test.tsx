import { Map as LeafletMap } from 'leaflet'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth'
import { RestaurantMapPage } from './RestaurantMapPage'

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
const data = { restaurants: [restaurant] }

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

function renderMap() {
  return render(
    <MemoryRouter initialEntries={['/mapa']}>
      <AuthProvider>
        <RestaurantMapPage />
        <CurrentLocation />
      </AuthProvider>
    </MemoryRouter>,
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

describe('RestaurantMapPage', () => {
  it('espera los datos y muestra el mapa ya encuadrado con sus marcadores, sin una ubicación provisional', async () => {
    let resolveRestaurants!: (response: Response) => void
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveRestaurants = resolve
        }),
    )
    const fitBounds = vi.spyOn(LeafletMap.prototype, 'fitBounds')
    const { container } = renderMap()
    expect(container.querySelector('.leaflet-container')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando restaurantes')
    expect(fitBounds).not.toHaveBeenCalled()
    await act(async () =>
      resolveRestaurants(
        response({
          data: [{ ...restaurant, latitude: -12.0464, longitude: -77.0428 }],
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
    fetchMock.mockResolvedValue(response({ data: data.restaurants }))
    const fitBounds = vi.spyOn(LeafletMap.prototype, 'fitBounds')
    const { unmount } = renderMap()
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

  it('excluye coordenadas ausentes, no finitas o fuera de rango', async () => {
    fetchMock.mockResolvedValue(
      response({
        data: [
          restaurant,
          restaurantWithoutCoordinates,
          { ...restaurant, id: 3, name: 'Local fuera de rango', latitude: 91 },
          { ...restaurant, id: 4, name: 'Local inválido', longitude: 'no disponible' },
        ],
      }),
    )
    renderMap()
    expect(await screen.findByRole('button', { name: 'Información de Verde Bowl' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Información de Local/ })).not.toBeInTheDocument()
    expect(screen.getByText('1 local ubicado en el mapa')).toBeInTheDocument()
  })

  it('abre información en el mapa y navega solo al pulsar Ver menú', async () => {
    fetchMock.mockResolvedValue(response({ data: data.restaurants }))
    renderMap()
    fireEvent.click(await screen.findByRole('button', { name: 'Información de Verde Bowl' }), {
      clientX: 600,
      clientY: 400,
    })
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/mapa')
    expect(screen.getByText(restaurant.address)).toBeInTheDocument()
    expect(screen.getByText(`Indicador ecológico: ${restaurant.ecoIndicator}`)).toBeInTheDocument()
    expect(screen.getByText('Envase biodegradable')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: 'Ver menú de Verde Bowl' }))
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/restaurantes/1')
  })

  it('permite activar el marcador con Enter', async () => {
    fetchMock.mockResolvedValue(response({ data: data.restaurants }))
    const user = userEvent.setup()
    renderMap()
    const marker = await screen.findByRole('button', { name: 'Información de Verde Bowl' })
    act(() => marker.focus())
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/mapa')
    expect(screen.getByRole('link', { name: 'Ver menú de Verde Bowl' })).toBeInTheDocument()
    expect(screen.getByText(restaurant.address)).toBeInTheDocument()
  })

  it('muestra el estado vacío cuando la API devuelve listas vacías', async () => {
    fetchMock.mockResolvedValue(
      response({
        message: 'Datos obtenidos correctamente',
        data: [],
      }),
    )
    renderMap()
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
    renderMap()
    expect(within(await screen.findByRole('alert')).getByText(/No pudimos conectarnos/)).toBeInTheDocument()
  })
})
