import { request, type ApiResult } from '@/shared/lib/http'
import type { CatalogRestaurant, RestaurantMenu } from './types'

const IMAGES_BASE_URL = (import.meta.env.VITE_IMAGES_BASE_URL || '').replace(/\/+$/, '')

function withImage<T extends { id: number; imageUrl: string | null }>(
  item: T,
  folder: 'restaurants' | 'dishes',
): T {
  return {
    ...item,
    imageUrl: item.imageUrl ?? (IMAGES_BASE_URL ? `${IMAGES_BASE_URL}/${folder}/${item.id}.jpg` : null),
  }
}

export const catalogService = {
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
