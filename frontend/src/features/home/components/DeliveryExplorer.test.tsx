import { act, fireEvent, render, screen } from '@testing-library/react'
import { Map as LeafletMap } from 'leaflet'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type * as RouteService from '../services/routeService'
import type * as DestinationService from '../services/deliveryDestination'
import { RestaurantMap } from './RestaurantMap'
import {
  getDestination,
  requestDestination,
  requestInitialDestination,
  setDestination,
} from '../services/deliveryDestination'
import { fetchRoute, LocationError, requestCurrentPosition, type RouteResult } from '../services/routeService'

vi.mock('../services/routeService', async (importOriginal) => ({
  ...(await importOriginal<typeof RouteService>()),
  requestCurrentPosition: vi.fn(),
  fetchRoute: vi.fn(),
}))
vi.mock('../services/deliveryDestination', async (importOriginal) => ({
  ...(await importOriginal<typeof DestinationService>()),
  requestInitialDestination: vi.fn(),
}))
const restaurants = [
  {
    id: 1,
    name: 'Local cercano',
    latitude: -34.6,
    longitude: -58.4,
    address: 'Calle Uno',
    biodegradablePackaging: true,
    ecoIndicator: 'Bici',
  },
  {
    id: 2,
    name: 'Local distante',
    latitude: -34.7,
    longitude: -58.5,
    address: 'Calle Dos',
    biodegradablePackaging: false,
    ecoIndicator: 'Bici',
  },
]
const destination = { latitude: -34.601, longitude: -58.401 }
const route: RouteResult = {
  distanceKm: 2.5,
  durationMinutes: 10,
  coordinates: [
    [-34.6, -58.4],
    [-34.601, -58.401],
  ],
}
function renderMap() {
  return render(
    <MemoryRouter>
      <RestaurantMap restaurants={restaurants} loading={false} error={null} />
    </MemoryRouter>,
  )
}
function select(name = 'Local cercano') {
  fireEvent.click(screen.getByRole('button', { name: `Información de ${name}` }))
}
beforeEach(() => {
  setDestination(null)
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
  vi.mocked(fetchRoute).mockReset().mockResolvedValue(route)
  vi.mocked(requestCurrentPosition)
    .mockReset()
    .mockResolvedValue({ ...destination, accuracy: 25 } as GeolocationCoordinates)
  vi.mocked(requestInitialDestination)
    .mockReset()
    .mockImplementation(() => requestDestination())
})
afterEach(() => {
  act(() => setDestination(null))
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('mapa simplificado', () => {
  it('solicita ubicación al entrar y solo muestra restaurantes, sin rutas ni panel', async () => {
    const { container } = renderMap()
    await act(async () => {})
    expect(requestCurrentPosition).toHaveBeenCalledTimes(1)
    expect(getDestination()).toEqual(destination)
    expect(fetchRoute).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Tu ubicación' })).not.toBeInTheDocument()
    expect(container.querySelector('.delivery-panel')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Elegir punto en el mapa' })).not.toBeInTheDocument()
  })

  it('calcula la ruta y el impacto solamente al seleccionar un restaurante', async () => {
    setDestination(destination)
    renderMap()
    expect(fetchRoute).not.toHaveBeenCalled()
    select()
    expect(await screen.findByText('0,45 kg de CO₂')).toBeInTheDocument()
    expect(fetchRoute).toHaveBeenCalledWith(restaurants[0], destination, expect.any(AbortSignal))
    expect(screen.getByText('2,5 km')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tu ubicación' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver más de Local cercano' })).toHaveAttribute(
      'href',
      '/restaurantes?restaurante=1',
    )
  })

  it('vuelve a solicitar ubicación al seleccionar un local después de rechazarla al inicio', async () => {
    vi.mocked(requestCurrentPosition).mockRejectedValueOnce(new LocationError(1, 'Ubicación bloqueada.'))
    renderMap()
    await act(async () => {})
    expect(requestCurrentPosition).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    select()
    expect(await screen.findByText('0,45 kg de CO₂')).toBeInTheDocument()
    expect(requestCurrentPosition).toHaveBeenCalledTimes(2)
  })

  it('si persiste el bloqueo, muestra ayuda en la ficha sin modal y permite reintentar', async () => {
    vi.mocked(requestCurrentPosition).mockRejectedValue(new LocationError(1, 'Ubicación bloqueada.'))
    renderMap()
    await act(async () => {})
    select()
    expect(await screen.findByRole('alert')).toHaveTextContent('bloqueada')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchRoute).not.toHaveBeenCalled()
    expect(screen.getByText(/icono junto a la dirección/)).toBeInTheDocument()
    vi.mocked(requestCurrentPosition).mockResolvedValue({
      ...destination,
      accuracy: 25,
    } as GeolocationCoordinates)
    fireEvent.click(screen.getByRole('button', { name: 'Permitir ubicación' }))
    expect(await screen.findByText('0,45 kg de CO₂')).toBeInTheDocument()
  })

  it('comparte una solicitud pendiente si se selecciona un local mientras aparece el aviso nativo', async () => {
    let resolvePosition!: (position: GeolocationCoordinates) => void
    vi.mocked(requestCurrentPosition).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePosition = resolve
        }),
    )
    renderMap()
    select()
    expect(requestCurrentPosition).toHaveBeenCalledTimes(1)
    expect(fetchRoute).not.toHaveBeenCalled()
    await act(async () => resolvePosition({ ...destination } as GeolocationCoordinates))
    expect(await screen.findByText('0,45 kg de CO₂')).toBeInTheDocument()
  })

  it('mantiene los locales accesibles cuando falla la ruta y ofrece reintentar', async () => {
    vi.mocked(fetchRoute).mockRejectedValueOnce(new Error('offline'))
    setDestination(destination)
    renderMap()
    select()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos calcular')
    expect(screen.queryByText(/kg de CO₂/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver más de Local cercano' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar ruta' }))
    expect(await screen.findByText('0,45 kg de CO₂')).toBeInTheDocument()
  })

  it('cancela e ignora respuestas de un local anterior', async () => {
    let resolveFirst!: (value: RouteResult) => void
    vi.mocked(fetchRoute).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve
        }),
    )
    setDestination(destination)
    renderMap()
    select()
    const firstSignal = vi.mocked(fetchRoute).mock.calls[0]![2]!
    select('Local distante')
    expect(firstSignal.aborted).toBe(true)
    await screen.findByText('0,45 kg de CO₂')
    await act(async () => resolveFirst({ ...route, distanceKm: 100 }))
    expect(screen.queryByText('18 kg de CO₂')).not.toBeInTheDocument()
  })

  it('al volver conserva la ubicación, pero espera otra selección para trazar la ruta', () => {
    setDestination(destination)
    const first = renderMap()
    first.unmount()
    renderMap()
    expect(requestCurrentPosition).not.toHaveBeenCalled()
    expect(fetchRoute).not.toHaveBeenCalled()
    const fit = vi.spyOn(LeafletMap.prototype, 'fitBounds')
    fireEvent.scroll(window)
    expect(fit).not.toHaveBeenCalled()
  })
})
