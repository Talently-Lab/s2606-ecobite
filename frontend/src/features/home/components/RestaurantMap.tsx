import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { divIcon, type FitBoundsOptions } from 'leaflet'
import { MapContainer, Marker, TileLayer, Popup, ZoomControl, useMap } from 'react-leaflet'
import { ArrowUpRight, LoaderCircle, MapPin } from 'lucide-react'
import { Alert } from '@/shared/components/ui'
import { ROUTES, selectedRestaurantUrl } from '@/shared/config/routes'
import type { Restaurant } from '../types'
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
  onReady,
}: {
  restaurants: LocatedRestaurant[]
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
        restaurants.map(({ latitude, longitude }): [number, number] => [latitude, longitude]),
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
  }, [map, restaurants, onReady])
  return null
}

export function RestaurantMap({ restaurants, loading, error }: RestaurantMapProps) {
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
        <h2>Elegí dónde comer</h2>
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
    </div>
  )
}

function PreparedMap({ restaurants }: { restaurants: LocatedRestaurant[] }) {
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
                  <Link
                    className="eco-button"
                    to={selectedRestaurantUrl(restaurant.id)}
                    aria-label={`Ver más de ${restaurant.name}`}
                  >
                    Ver más <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapViewport restaurants={restaurants} onReady={setPrepared} />
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
          : 'Seleccioná un marcador para conocer el local. Pulsá «Ver más» para explorarlo.'}
      </p>
    </>
  )
}
