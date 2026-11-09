import { useId, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Button, Alert } from './ui'
import { request } from '@/shared/lib/http'
import { getOrders, setOrderDestination, useOrders, type DeliveryDestination } from '@/shared/lib/orderDraft'
import { requestCurrentPosition } from '@/features/home'
import 'leaflet/dist/leaflet.css'
const icon = divIcon({
  html: '<span aria-hidden="true">📍</span>',
  className: 'destination-pin',
  iconSize: [28, 28],
})
export function DeliveryDestinationField({
  disabled = false,
  showMap = true,
}: {
  disabled?: boolean
  showMap?: boolean
}) {
  const state = useOrders()
  const destination = state.destination
  const id = useId()
  const [text, setText] = useState('')
  const [results, setResults] = useState<DeliveryDestination[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const generation = useRef(0)
  async function locate() {
    const owner = state.ownerId
    const attempt = ++generation.current
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const { latitude, longitude } = await requestCurrentPosition()
      if (getOrders().ownerId === owner && generation.current === attempt)
        setOrderDestination({ latitude, longitude, label: 'Mi ubicación actual' })
    } catch (error) {
      if (generation.current === attempt)
        setError(error instanceof Error ? error.message : 'No pudimos obtener tu ubicación.')
    } finally {
      if (generation.current === attempt) setLoading(false)
    }
  }
  async function search() {
    const attempt = ++generation.current
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const { data } = await request<{ data: DeliveryDestination[] }>(
        `/delivery/addresses?q=${encodeURIComponent(text.trim())}`,
      )
      if (generation.current === attempt) setResults(data)
    } catch (error) {
      if (generation.current === attempt)
        setError(error instanceof Error ? error.message : 'No pudimos buscar la dirección.')
    } finally {
      if (generation.current === attempt) setLoading(false)
    }
  }
  return (
    <fieldset className="delivery-destination grid gap-3" disabled={disabled || !!state.pending}>
      <legend className={showMap ? 'font-semibold' : 'sr-only'}>Destino de entrega</legend>
      <Button type="button" disabled={loading} onClick={() => void locate()}>
        Usar mi ubicación
      </Button>
      <label htmlFor={id}>Buscar dirección (incluí ciudad y país)</label>
      <input
        id={id}
        className="w-full rounded-lg border p-3"
        value={text}
        maxLength={200}
        onChange={(event) => {
          setText(event.target.value)
          setResults(null)
          generation.current++
          setLoading(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            if (text.trim().length >= 3 && !loading) void search()
          }
        }}
      />
      <Button type="button" disabled={loading || text.trim().length < 3} onClick={() => void search()}>
        Buscar dirección
      </Button>
      {loading && <p role="status">Buscando ubicación…</p>}
      {error && <Alert>{error}</Alert>}
      {results && (
        <div aria-live="polite">
          {results.length ? (
            <>
              <p>Elegí y confirmá una dirección:</p>
              {results.map((point, index) => (
                <button
                  className="block min-h-11 w-full text-left underline"
                  key={index}
                  type="button"
                  onClick={() => {
                    setOrderDestination(point)
                    setResults(null)
                  }}
                >
                  {point.label}
                </button>
              ))}
            </>
          ) : (
            <p>No encontramos direcciones. Agregá ciudad o país y volvé a buscar.</p>
          )}
        </div>
      )}
      <small className="block">
        Búsqueda:{' '}
        <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">
          Geoapify
        </a>{' '}
        · <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
      </small>
      {destination ? (
        <>
          <p role="status">Destino confirmado: {destination.label}</p>
          {showMap && (
            <p className="text-sm">
              Verificá en el mapa que sea la dirección donde querés recibir el pedido.
            </p>
          )}
          {showMap && (
            <MapContainer
              key={`${destination.latitude},${destination.longitude}`}
              center={[destination.latitude, destination.longitude]}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: 150, width: '100%', zIndex: 0 }}
              aria-label="Destino confirmado en el mapa"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[destination.latitude, destination.longitude]}
                icon={icon}
                alt={destination.label}
                title={destination.label}
              />
            </MapContainer>
          )}
        </>
      ) : (
        <p>Elegí un destino para estimar el recorrido y la entrega.</p>
      )}
    </fieldset>
  )
}
