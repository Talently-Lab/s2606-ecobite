import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DeliveryDestinationField } from './DeliveryDestinationField'
import { claimOrderOwner, clearOrders, getOrders, setOrderDestination } from '../lib/orderDraft'
import { requestCurrentPosition } from '@/features/home'
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: { children: React.ReactNode; 'aria-label': string }) => (
    <div aria-label={props['aria-label']}>{children}</div>
  ),
  Marker: () => null,
  TileLayer: () => null,
}))
vi.mock('@/features/home', () => ({ requestCurrentPosition: vi.fn() }))
const fetchMock = vi.fn()
beforeEach(() => {
  clearOrders()
  vi.mocked(requestCurrentPosition).mockReset()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())
describe('destino confirmado', () => {
  it('carga el mapa solo al mostrar un destino confirmado y conserva el formulario', async () => {
    const { rerender } = render(<DeliveryDestinationField showMap={false} />)
    const address = screen.getByLabelText(/Buscar dirección/)
    act(() => setOrderDestination({ latitude: 1, longitude: 2, label: 'Destino elegido' }))
    expect(screen.queryByLabelText('Destino confirmado en el mapa')).not.toBeInTheDocument()
    expect(screen.queryByText('Cargando mapa del destino…')).not.toBeInTheDocument()
    rerender(<DeliveryDestinationField />)
    expect(await screen.findByLabelText('Destino confirmado en el mapa')).toBeInTheDocument()
    expect(screen.getByLabelText(/Buscar dirección/)).toBe(address)
    act(() => setOrderDestination(null))
    expect(screen.queryByLabelText('Destino confirmado en el mapa')).not.toBeInTheDocument()
  })
  it('busca solo por acción y exige seleccionar entre resultados ambiguos', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { latitude: 1, longitude: 2, label: 'Primera ciudad' },
            { latitude: 3, longitude: 4, label: 'Segunda ciudad' },
          ],
        }),
      ),
    )
    render(<DeliveryDestinationField />)
    fireEvent.change(screen.getByLabelText(/Buscar dirección/), { target: { value: 'Calle Mayor' } })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(requestCurrentPosition).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Buscar dirección' }))
    await screen.findByRole('button', { name: 'Primera ciudad' })
    expect(getOrders().destination).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Segunda ciudad' }))
    expect(getOrders().destination?.label).toBe('Segunda ciudad')
    expect(screen.getByText('Destino confirmado: Segunda ciudad')).toBeInTheDocument()
  })
  it('explica búsquedas sin resultados', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: [] })))
    render(<DeliveryDestinationField />)
    fireEvent.change(screen.getByLabelText(/Buscar dirección/), { target: { value: 'Calle inexistente' } })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar dirección' }))
    expect(await screen.findByText(/No encontramos direcciones/)).toBeInTheDocument()
    expect(getOrders().destination).toBeNull()
  })
  it('mantiene el destino existente cuando GPS falla y permite buscar dirección', async () => {
    setOrderDestination({ latitude: 1, longitude: 2, label: 'Destino previo' })
    vi.mocked(requestCurrentPosition).mockRejectedValue(new Error('Permiso denegado'))
    render(<DeliveryDestinationField />)
    fireEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Permiso denegado')
    expect(getOrders().destination?.label).toBe('Destino previo')
    expect(screen.getByRole('button', { name: 'Buscar dirección' })).toBeDisabled()
  })
  it('ignora el GPS solicitado por una cuenta anterior', async () => {
    claimOrderOwner(1)
    let resolve!: (value: GeolocationCoordinates) => void
    vi.mocked(requestCurrentPosition).mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    render(<DeliveryDestinationField />)
    fireEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }))
    act(() => claimOrderOwner(2))
    await act(async () => resolve({ latitude: 1, longitude: 2 } as GeolocationCoordinates))
    expect(getOrders().destination).toBeNull()
  })
})
