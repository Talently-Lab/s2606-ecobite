import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { divIcon, type FitBoundsOptions } from 'leaflet'
import { MapContainer, Marker, TileLayer, Popup, ZoomControl, useMap } from 'react-leaflet'
import { ArrowUpRight, LoaderCircle, MapPin } from 'lucide-react'
import { Alert } from '@/shared/components/ui'
import { ROUTES, restaurantMenuUrl } from '@/shared/config/routes'
import { DeliveryExplorer } from './DeliveryExplorer'
import { useDeliveryEstimate } from '../services/useDeliveryEstimate'
import { DeliveryDestinationField } from '@/shared/components/DeliveryDestinationField'
import type { Restaurant } from '../types'
import type { Coordinates } from '../services/routeService'
import 'leaflet/dist/leaflet.css'

interface RestaurantMapProps {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
}

type LocatedRestaurant = Restaurant & { latitude: number; longitude: number }
const BOUNDS_OPTIONS: FitBoundsOptions = {
  paddingTopLeft: [48, 220],
  paddingBottomRight: [48, 70],
  maxZoom: 14,
  animate: false,
}
const restaurantIcon = divIcon({
  className: 'restaurant-pin',
  html: '<span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span>',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

function MapViewport({
  restaurants,
  destination,
  onReady,
}: {
  restaurants: LocatedRestaurant[]
  destination: Coordinates | null
  onReady: (ready: boolean) => void
}) {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    let width = 0,
      height = 0
    const fit = () => {
      const nextWidth = container.clientWidth,
        nextHeight = container.clientHeight
      if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height)) return
      width = nextWidth
      height = nextHeight
      map.invalidateSize({ pan: false, animate: false })
      map.fitBounds(
        [...restaurants, ...(destination ? [destination] : [])].map(
          ({ latitude, longitude }): [number, number] => [latitude, longitude],
        ),
        BOUNDS_OPTIONS,
      )
      // This component mounts after the markers, so the first visible frame includes them.
      onReady(true)
    }
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    observer.observe(container)
    return () => observer.disconnect()
  }, [map, restaurants, destination, onReady])
  return null
}

export function RestaurantMap({ restaurants, loading, error }: RestaurantMapProps) {
  const [editingDestination, setEditingDestination] = useState(false)
  const located = useMemo(
    () =>
      restaurants.filter(
        (restaurant): restaurant is LocatedRestaurant =>
          typeof restaurant.latitude === 'number' &&
          Number.isFinite(restaurant.latitude) &&
          Math.abs(restaurant.latitude) <= 90 &&
          typeof restaurant.longitude === 'number' &&
          Number.isFinite(restaurant.longitude) &&
          Math.abs(restaurant.longitude) <= 180,
      ),
    [restaurants],
  )

  return (
    <div className="restaurant-map">
      {!loading && !error && located.length > 0 ? (
        <PreparedMap
          key={JSON.stringify(located.map(({ id, latitude, longitude }) => [id, latitude, longitude]))}
          restaurants={located}
        />
      ) : (
        <div className="map-placeholder" aria-hidden="true">
          <MapPin size={60} />
        </div>
      )}
      <div className="map-legend">
        <span className="eyebrow">
          <MapPin size={16} aria-hidden="true" /> TU PRÓXIMA COMIDA, CERCA
        </span>
        <h1>Elegí dónde comer</h1>
        {loading ? (
          <p role="status">Cargando restaurantes…</p>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : (
          <p>
            {located.length
              ? `${located.length} ${located.length === 1 ? 'local ubicado' : 'locales ubicados'} en el mapa`
              : 'Todavía no hay restaurantes con ubicación disponible.'}
          </p>
        )}
        <Link to={ROUTES.restaurants} className="text-link">
          Ver todos los restaurantes <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <details
        className="map-destination"
        onToggle={(event) => setEditingDestination(event.currentTarget.open)}
      >
        <summary>Destino de entrega</summary>
        {editingDestination && <DeliveryDestinationField showMap={false} />}
      </details>
    </div>
  )
}

function PreparedMap({ restaurants }: { restaurants: LocatedRestaurant[] }) {
  const [selection, setSelection] = useState<{ id: number } | null>(null)
  const selected = restaurants.find((restaurant) => restaurant.id === selection?.id)
  const delivery = useDeliveryEstimate(selection, selected)
  const [prepared, setPrepared] = useState(false)
  const [tileError, setTileError] = useState(false)
  const bounds = useMemo(
    () => restaurants.map(({ latitude, longitude }): [number, number] => [latitude, longitude]),
    [restaurants],
  )
  return (
    <>
      <div className={`map-scene ${prepared ? 'is-prepared' : ''}`} aria-hidden={!prepared} inert={!prepared}>
        <MapContainer
          bounds={bounds}
          boundsOptions={BOUNDS_OPTIONS}
          scrollWheelZoom={false}
          zoomControl={false}
          className="restaurant-map-canvas"
          aria-label="Explorar ubicaciones de restaurantes"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ tileerror: () => setTileError(true), tileload: () => setTileError(false) }}
          />
          <ZoomControl position="bottomright" />
          {restaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={restaurantIcon}
              keyboard
              riseOnHover
              title={`Información de ${restaurant.name}`}
              alt={`Información de ${restaurant.name}`}
              eventHandlers={{
                popupopen: () => setSelection({ id: restaurant.id }),
                keydown: (event) => {
                  if (event.originalEvent.key === ' ' || event.originalEvent.key === 'Enter') {
                    event.originalEvent.preventDefault()
                    event.target.openPopup()
                  }
                },
              }}
            >
              <Popup
                className="restaurant-popup"
                minWidth={230}
                maxWidth={300}
                autoPanPaddingTopLeft={[24, 230]}
                autoPanPaddingBottomRight={[24, 60]}
              >
                <div className="restaurant-popup-content">
                  <span className="eyebrow">CONOCÉ EL LOCAL</span>
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.address}</p>
                  <p>Indicador ecológico: {restaurant.ecoIndicator}</p>
                  {restaurant.biodegradablePackaging && <p className="eco-tag">Envase biodegradable</p>}
                  {selection?.id === restaurant.id && (
                    <div className="delivery-estimate" aria-live="polite">
                      {delivery.error ? (
                        <>
                          <p role="alert">{delivery.error}</p>
                          <button type="button" onClick={delivery.retry}>
                            Reintentar ruta
                          </button>
                        </>
                      ) : !delivery.route ? (
                        <p role="status">
                          {delivery.destination
                            ? 'Calculando ruta…'
                            : 'Elegí un destino para estimar el recorrido.'}
                        </p>
                      ) : (
                        <>
                          <p>
                            Distancia por calles:{' '}
                            <strong>
                              {delivery.route.distanceKm.toLocaleString('es-AR', {
                                maximumFractionDigits: 1,
                              })}{' '}
                              km
                            </strong>
                          </p>
                          <p>
                            Ahorro potencial:{' '}
                            <strong>
                              {delivery.route.co2SavedKg.toLocaleString('es-AR', {
                                maximumFractionDigits: 2,
                              })}{' '}
                              kg de CO₂
                            </strong>
                          </p>
                          <details>
                            <summary>Cómo se calcula</summary>
                            <small>
                              Distancia × 170 g CO₂/km ÷ 1000. Comparación provisional entre auto y bici, solo
                              emisiones directas. Ruta de referencia para auto; no confirma cobertura ni
                              tiempo de delivery. No se suma a Mi impacto.
                            </small>
                            <Link to={ROUTES.methodology}>Ver metodología</Link>
                          </details>
                        </>
                      )}
                    </div>
                  )}
                  <Link
                    className="eco-button"
                    to={restaurantMenuUrl(restaurant.id)}
                    aria-label={`Ver menú de ${restaurant.name}`}
                  >
                    Ver menú <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
          <DeliveryExplorer destination={delivery.destination} route={delivery.route} />
          <MapViewport restaurants={restaurants} destination={delivery.destination} onReady={setPrepared} />
        </MapContainer>
      </div>
      {!prepared && (
        <div className="map-preparation" role="status">
          <LoaderCircle size={22} className="motion-safe:animate-spin" aria-hidden="true" />
          Preparando mapa…
        </div>
      )}
      <p className="map-instruction">
        {tileError
          ? 'No pudimos cargar parte del mapa. Podés explorar todos los locales en el catálogo.'
          : 'Seleccioná un restaurante para conocerlo y ver su menú.'}
      </p>
    </>
  )
}
