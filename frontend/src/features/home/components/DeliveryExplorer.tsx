import { useEffect } from 'react'
import { Marker, Polyline, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import type { Coordinates, RouteResult } from '../services/routeService'
import './delivery-explorer.css'

const locationIcon = divIcon({
  className: 'delivery-pin',
  html: '<span aria-hidden="true"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export function DeliveryExplorer({
  destination,
  route,
}: {
  destination: Coordinates | null
  route: RouteResult | undefined
}) {
  const map = useMap()
  useEffect(() => {
    if (!route) return
    map.fitBounds(route.coordinates, {
      paddingTopLeft: [30, Math.min(220, map.getContainer().clientHeight * 0.3)],
      paddingBottomRight: [50, 70],
      maxZoom: 15,
      animate: false,
    })
  }, [map, route])
  if (!destination || !route) return null
  return (
    <>
      <Marker
        position={[destination.latitude, destination.longitude]}
        icon={locationIcon}
        title="Tu ubicación"
        alt="Tu ubicación"
      />
      <Polyline positions={route.coordinates} pathOptions={{ color: '#2563a6', weight: 5 }} />
    </>
  )
}
