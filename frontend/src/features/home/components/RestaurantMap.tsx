import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
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
      className="relative z-0 h-[420px] w-full overflow-hidden rounded-3xl border border-borde shadow-[0_16px_48px_rgb(30_43_34/0.14)]"
      aria-label="Mapa de restaurantes"
    >
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
              <strong>{restaurant.name}</strong>
              <br />
              {restaurant.address}
              <br />
              <a href={restaurantMenuUrl(restaurant.id)}>Ver menú</a>
              <br />
              <button type="button" onClick={() => void handleDirections(restaurant)}>
                Cómo llegar
              </button>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {mappedRestaurants.length === 0 && (
        <p className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl bg-white/95 p-3 text-center text-sm text-musgo shadow">
          Todavía no hay restaurantes con ubicación disponible.
        </p>
      )}
      {selectedRestaurant && (
        <div className="absolute left-4 top-4 z-[1000] max-w-[280px] rounded-xl bg-white/95 p-3 text-sm text-musgo shadow">
          <strong>Ruta a {selectedRestaurant.name}</strong>
          {loadingRoute && <p className="m-0 mt-1">Calculando ruta…</p>}
          {routeError && (
            <div className="mt-1">
              <p className="m-0">{routeError}</p>
              <button
                type="button"
                className="mt-2 font-semibold text-bosque underline"
                onClick={() => void handleDirections(selectedRestaurant)}
              >
                Intentar de nuevo
              </button>
            </div>
          )}
          {route && !loadingRoute && (
            <p className="m-0 mt-1">
              {formatDistance(route.distanceKm)} · {Math.round(route.durationMinutes)} min
              <br />
              Ahorro estimado en bici: {estimatedSavings?.toFixed(2)} kg CO₂
            </p>
          )}
        </div>
      )}
    </div>
  )
}
