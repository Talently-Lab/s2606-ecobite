import { ArrowRight, Leaf, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { restaurantMenuUrl } from '@/shared/config/routes'
import { FoodImage } from './catalogComponents'
import type { CatalogRestaurant } from './types'
import './restaurant-list.css'

export function RestaurantList({ restaurants }: { restaurants: CatalogRestaurant[] }) {
  return (
    <section aria-label="Restaurantes" className="restaurant-list">
      {restaurants.map((restaurant) => (
        <article key={restaurant.id} className="restaurant-card">
          <FoodImage src={restaurant.imageUrl} alt={restaurant.name} />
          <div className="restaurant-card-details">
            <h2>{restaurant.name}</h2>
            <p className="restaurant-address">
              <MapPin size={16} aria-hidden="true" />
              {restaurant.address}
            </p>
            <div className="restaurant-badges">
              {restaurant.category && <span>{restaurant.category}</span>}
              <span>Indicador ecológico: {restaurant.ecoIndicator}</span>
              {restaurant.biodegradablePackaging && (
                <span>
                  <Leaf size={14} aria-hidden="true" />
                  Envase biodegradable
                </span>
              )}
              {restaurant.rating !== null ? (
                <span className="restaurant-score" aria-label={`Valoración: ${restaurant.rating} de 5`}>
                  <Star size={14} aria-hidden="true" />
                  {restaurant.rating.toLocaleString('es-AR', { maximumFractionDigits: 1 })} / 5
                </span>
              ) : (
                <span>Sin valoraciones</span>
              )}
              {restaurant.estimatedDeliveryMinutes !== null && (
                <span>Entrega estimada: {restaurant.estimatedDeliveryMinutes} min</span>
              )}
            </div>
            <Link className="restaurant-menu-link" to={restaurantMenuUrl(restaurant.id)}>
              Ver menú de {restaurant.name}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </article>
      ))}
    </section>
  )
}
