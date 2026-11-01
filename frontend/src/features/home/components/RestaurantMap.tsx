import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { Bike, Clock3, Leaf, MapPinned, Navigation, Route, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { restaurantMenuUrl } from '@/shared/config/routes'
import type { Restaurant } from '../types'
import {
  calculateEstimatedBikeSavings,
  fetchRoute,
  requestCurrentPosition,
  type RouteResult,
} from '../services/routeService'
import 'leaflet/dist/leaflet.css'

interface RestaurantMapProps {
  restaurants: Restaurant[]
}

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816]

function RouteViewport({ route }: { route: RouteResult }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(route.coordinates, { padding: [32, 32] })
  }, [map, route])
  return null
}

function formatDistance(distanceKm: number) {
  return distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`
}

export function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const requestId = useRef(0)
  const mappedRestaurants = restaurants.filter(
    (restaurant): restaurant is Restaurant & { latitude: number; longitude: number } =>
      typeof restaurant.latitude === 'number' &&
      Number.isFinite(restaurant.latitude) &&
      Math.abs(restaurant.latitude) <= 90 &&
      typeof restaurant.longitude === 'number' &&
      Number.isFinite(restaurant.longitude) &&
      Math.abs(restaurant.longitude) <= 180,
  )
  const center: [number, number] = mappedRestaurants.length
    ? [mappedRestaurants[0]!.latitude, mappedRestaurants[0]!.longitude]
    : DEFAULT_CENTER
  const bounds = mappedRestaurants.map(({ latitude, longitude }): [number, number] => [latitude, longitude])

  async function handleDirections(restaurant: Restaurant & { latitude: number; longitude: number }) {
    const currentRequestId = ++requestId.current
    setSelectedRestaurantId(restaurant.id)
    setRoute(null)
    setRouteError(null)
    setLoadingRoute(true)
    try {
      const position = await requestCurrentPosition()
      const nextRoute = await fetchRoute(position, restaurant)
      if (currentRequestId !== requestId.current) return
      setRoute(nextRoute)
    } catch (error) {
      if (currentRequestId !== requestId.current) return
      setRouteError(error instanceof Error ? error.message : 'No pudimos calcular la ruta.')
    } finally {
      if (currentRequestId === requestId.current) setLoadingRoute(false)
    }
  }

  const selectedRestaurant = mappedRestaurants.find(({ id }) => id === selectedRestaurantId)
  const estimatedSavings = route ? calculateEstimatedBikeSavings(route.distanceKm) : null

  return (
    <div
      className="relative z-0 w-full overflow-hidden rounded-3xl border border-borde bg-white shadow-[0_16px_48px_rgb(30_43_34/0.14)]"
      aria-label="Mapa de restaurantes"
    >
      <div className="flex items-start justify-between gap-4 border-b border-borde px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-bosque">
            <MapPinned size={18} aria-hidden="true" />
            Restaurantes cerca tuyo
          </div>
          <p className="m-0 mt-1 text-sm text-musgo">
            {mappedRestaurants.length
              ? `${mappedRestaurants.length} locales ubicados en el mapa`
              : 'No hay ubicaciones disponibles por ahora'}
          </p>
        </div>
        <span className="hidden rounded-full bg-arena px-3 py-1 text-xs font-semibold text-musgo sm:inline-flex">
          OpenStreetMap
        </span>
      </div>

      <div className="relative h-[360px] sm:h-[390px]">
        <MapContainer
          center={center}
          zoom={13}
          bounds={bounds.length ? bounds : undefined}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {route && (
            <>
              <Polyline positions={route.coordinates} pathOptions={{ color: '#D4772C', weight: 5 }} />
              <RouteViewport route={route} />
            </>
          )}
          {mappedRestaurants.map((restaurant) => (
            <CircleMarker
              key={restaurant.id}
              center={[restaurant.latitude, restaurant.longitude]}
              radius={9}
              pathOptions={{ color: '#24402A', fillColor: '#436844', fillOpacity: 1 }}
            >
              <Popup>
                <div className="min-w-[190px]">
                  <p className="m-0 text-base font-semibold text-[#24402A]">{restaurant.name}</p>
                  <p className="m-0 mt-1 text-sm text-[#5A6B5E]">{restaurant.address}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      className="inline-flex min-h-9 items-center rounded-full bg-[#436844] px-3 text-sm font-semibold text-white no-underline"
                      href={restaurantMenuUrl(restaurant.id)}
                    >
                      Ver menú
                    </a>
                    <button
                      className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#436844] bg-white px-3 text-sm font-semibold text-[#436844]"
                      type="button"
                      onClick={() => void handleDirections(restaurant)}
                    >
                      <Navigation size={14} aria-hidden="true" />
                      Cómo llegar
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {mappedRestaurants.length > 0 && !route && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-[400] rounded-xl bg-white/95 px-3 py-2 text-xs text-musgo shadow">
            <span className="mr-2 inline-block size-2 rounded-full bg-bosque align-middle" />
            Locales disponibles
          </div>
        )}
        {mappedRestaurants.length === 0 && (
          <p className="pointer-events-none absolute inset-x-4 bottom-4 z-[400] rounded-xl bg-white/95 p-3 text-center text-sm text-musgo shadow">
            Todavía no hay restaurantes con ubicación disponible.
          </p>
        )}
        {selectedRestaurant && (
          <div className="absolute inset-x-3 bottom-3 z-[1000] rounded-2xl border border-borde bg-white/95 p-4 text-musgo shadow-lg backdrop-blur sm:left-auto sm:max-w-[330px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-bosque">Tu ruta</p>
                <strong className="mt-1 block text-base text-[#24402A]">{selectedRestaurant.name}</strong>
              </div>
              <button
                type="button"
                aria-label="Cerrar información de ruta"
                className="rounded-full p-1 text-musgo hover:bg-arena"
                onClick={() => {
                  requestId.current += 1
                  setSelectedRestaurantId(null)
                  setRoute(null)
                  setRouteError(null)
                  setLoadingRoute(false)
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {loadingRoute && (
              <p className="m-0 mt-2 flex items-center gap-2 text-sm">
                <Route size={16} className="animate-pulse text-terracota" aria-hidden="true" />
                Calculando la mejor ruta…
              </p>
            )}
            {routeError && (
              <div className="mt-2">
                <p className="m-0 text-sm">{routeError}</p>
                <button
                  type="button"
                  className="mt-2 min-h-10 rounded-full bg-bosque px-4 text-sm font-semibold text-white"
                  onClick={() => void handleDirections(selectedRestaurant)}
                >
                  Intentar de nuevo
                </button>
              </div>
            )}
            {route && !loadingRoute && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-arena px-3 py-2">
                    <span className="flex items-center gap-1 text-xs text-musgo">
                      <Route size={14} aria-hidden="true" />
                      Distancia
                    </span>
                    <strong className="mt-1 block text-sm text-[#24402A]">{formatDistance(route.distanceKm)}</strong>
                  </div>
                  <div className="rounded-xl bg-arena px-3 py-2">
                    <span className="flex items-center gap-1 text-xs text-musgo">
                      <Clock3 size={14} aria-hidden="true" />
                      Duración
                    </span>
                    <strong className="mt-1 block text-sm text-[#24402A]">
                      {Math.round(route.durationMinutes)} min
                    </strong>
                  </div>
                </div>
                <div className="mt-2 flex items-start gap-2 rounded-xl bg-[#EAF3E2] px-3 py-2 text-sm text-bosque">
                  <Bike size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    <strong>{estimatedSavings?.toFixed(2)} kg CO₂</strong> estimados evitados en bici.
                    <small className="mt-0.5 block text-xs text-musgo">Cálculo orientativo, no es tu impacto oficial.</small>
                  </span>
                </div>
              </>
            )}
            {!loadingRoute && !routeError && !route && (
              <p className="m-0 mt-2 text-sm text-musgo">Permitinos acceder a tu ubicación para calcularla.</p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-borde bg-[#FBFAF6] px-5 py-3 text-xs text-musgo sm:px-6">
        <Leaf size={15} className="text-bosque" aria-hidden="true" />
        Elegí un local para ver el menú o calcular cómo llegar.
      </div>
    </div>
  )
}
