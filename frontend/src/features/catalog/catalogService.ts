import { request, type ApiResult } from '@/shared/lib/http'
import type { CatalogRestaurant, RestaurantMenu, RestaurantRating, RestaurantRatings } from './types'

const IMAGES_BASE_URL = (import.meta.env.VITE_IMAGES_BASE_URL || '').replace(/\/+$/, '')

export function withImage<T extends { id: number; imageUrl?: string | null }>(
  item: T,
  folder: 'restaurants' | 'dishes',
): T {
  return {
    ...item,
    imageUrl: item.imageUrl ?? (IMAGES_BASE_URL ? `${IMAGES_BASE_URL}/${folder}/${item.id}.jpg` : null),
  }
}

export const catalogService = {
  ratings: (id: number) => request<ApiResult<RestaurantRatings>>(`/restaurantes/${id}/valoraciones`),
  createRating: (id: number, body: { score: number; comment: string | null }) =>
    request<ApiResult<RestaurantRating>>(`/restaurantes/${id}/valoraciones`, { method: 'POST', body }),
  list: (search: string, categoria: string) => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (categoria) params.set('categoria', categoria)
    const query = params.toString()
    return request<ApiResult<CatalogRestaurant[]>>(`/restaurantes${query ? `?${query}` : ''}`).then(
      (result) => ({
        ...result,
        data: result.data.map((restaurant) => withImage(restaurant, 'restaurants')),
      }),
    )
  },
  menu: (id: number) =>
    request<ApiResult<RestaurantMenu>>(`/restaurantes/${id}`).then((result) => ({
      ...result,
      data: {
        restaurant: withImage(result.data.restaurant, 'restaurants'),
        dishes: result.data.dishes.map((dish) => withImage(dish, 'dishes')),
      },
    })),
}
