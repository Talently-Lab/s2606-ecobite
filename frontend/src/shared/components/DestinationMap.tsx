import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { divIcon } from 'leaflet'
import type { DeliveryDestination } from '@/shared/lib/orderDraft'
import 'leaflet/dist/leaflet.css'

const icon = divIcon({
  html: '<span aria-hidden="true">📍</span>',
  className: 'destination-pin',
  iconSize: [28, 28],
})

export default function DestinationMap({ destination }: { destination: DeliveryDestination }) {
  return (
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
  )
}
