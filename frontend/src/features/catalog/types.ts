import type { Restaurant, FeaturedDish } from '@/features/home'
export interface CatalogRestaurant extends Restaurant {
  imageUrl: string | null
  category: string | null
  estimatedDeliveryMinutes: number | null
  rating: number | null
}
export interface CatalogDish extends FeaturedDish {
  restaurantId: number
  imageUrl: string | null
  available: boolean
}
export interface RestaurantMenu {
  restaurant: CatalogRestaurant
  dishes: CatalogDish[]
}
export interface ApiResult<T> {
  message: string
  data: T
}
