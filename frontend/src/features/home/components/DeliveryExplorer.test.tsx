import { act, fireEvent, render, screen } from '@testing-library/react'
import { Map as LeafletMap } from 'leaflet'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type * as RouteService from '../services/routeService'
import { RestaurantMap } from './RestaurantMap'
import { getDestination, setDestination } from '../services/deliveryDestination'
import { fetchRoute, LocationError, requestCurrentPosition, type RouteResult } from '../services/routeService'

vi.mock('../services/routeService', async (importOriginal) => ({
  ...(await importOriginal<typeof RouteService>()),
  requestCurrentPosition: vi.fn(),
  fetchRoute: vi.fn(),
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
const destination = { latitude: -34.601, longitude: -58.401, label: 'Destino elegido' }
const route: RouteResult = {
  distanceKm: 2.5,
  co2SavedKg: 0.43,
  methodology: 'transport-170g-v1',
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
    .mockResolvedValue({
      ...destination,
      accuracy: 25,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({}),
    })
})
afterEach(() => {
  act(() => setDestination(null))
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('mapa simplificado', () => {
  it('muestra locales y destino en un solo mapa antes de calcular una ruta', async () => {
    setDestination(destination)
    const { container } = renderMap()
    expect(screen.getByRole('button', { name: 'Información de Local cercano' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Información de Local distante' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Destino de entrega' })).toBeInTheDocument()
    expect(fetchRoute).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Destino de entrega'))
    await screen.findByRole('button', { name: 'Usar mi ubicación' })
    expect(screen.getByText('Destino confirmado: Destino elegido')).toBeInTheDocument()
    expect(container.querySelectorAll('.leaflet-container')).toHaveLength(1)
    expect(container.querySelector('.leaflet-overlay-pane path')).not.toBeInTheDocument()
  })

  it('encuadra el destino confirmado junto con los restaurantes sin pedir una ruta', () => {
    renderMap()
    const fit = vi.spyOn(LeafletMap.prototype, 'fitBounds')
    act(() => setDestination(destination))
    expect(fit).toHaveBeenCalledWith(
      [...restaurants, destination].map(({ latitude, longitude }) => [latitude, longitude]),
      expect.any(Object),
    )
    expect(screen.getByRole('button', { name: 'Destino de entrega' })).toBeInTheDocument()
    expect(fetchRoute).not.toHaveBeenCalled()
  })

  it('espera una acción del usuario para pedir ubicación', async () => {
    const { container } = renderMap()
    await act(async () => {})
    expect(requestCurrentPosition).not.toHaveBeenCalled()
    expect(getDestination()).toBeNull()
    expect(fetchRoute).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Destino de entrega' })).not.toBeInTheDocument()
    expect(container.querySelector('.delivery-panel')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Elegir punto en el mapa' })).not.toBeInTheDocument()
  })

  it('calcula la ruta y el impacto solamente al seleccionar un restaurante', async () => {
    setDestination(destination)
    renderMap()
    expect(fetchRoute).not.toHaveBeenCalled()
    select()
    expect(await screen.findByText('0,43 kg de CO₂')).toBeInTheDocument()
    expect(fetchRoute).toHaveBeenCalledWith(restaurants[0]!.id, destination)
    expect(screen.getByText('2,5 km')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Destino de entrega' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver menú de Local cercano' })).toHaveAttribute(
      'href',
      '/restaurantes/1',
    )
  })

  it('muestra GPS denegado y permite reintentar solo por botón', async () => {
    vi.mocked(requestCurrentPosition).mockRejectedValueOnce(new LocationError(1, 'Ubicación bloqueada.'))
    renderMap()
    select()
    expect(requestCurrentPosition).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Destino de entrega'))
    await screen.findByRole('button', { name: 'Usar mi ubicación' })
    fireEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('bloqueada')
    expect(fetchRoute).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }))
    expect(await screen.findByText('0,43 kg de CO₂')).toBeInTheDocument()
  })

  it('mantiene los locales accesibles cuando falla la ruta y ofrece reintentar', async () => {
    vi.mocked(fetchRoute).mockRejectedValueOnce(new Error('No pudimos calcular el recorrido.'))
    setDestination(destination)
    renderMap()
    select()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos calcular')
    expect(screen.queryByText(/kg de CO₂/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver menú de Local cercano' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar ruta' }))
    expect(await screen.findByText('0,43 kg de CO₂')).toBeInTheDocument()
  })

  it('ignora respuestas de un local anterior', async () => {
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
    select('Local distante')
    await screen.findByText('0,43 kg de CO₂')
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
