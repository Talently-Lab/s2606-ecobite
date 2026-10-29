import { request } from '@/shared/lib/http'
import type { ApiResult, CatalogRestaurant, RestaurantMenu } from './types'

export const catalogService = {
  list: (search: string, categoria: string) => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (categoria) params.set('categoria', categoria)
    const query = params.toString()
    return request<ApiResult<CatalogRestaurant[]>>(`/restaurantes${query ? `?${query}` : ''}`)
  },
  menu: (id: number) => request<ApiResult<RestaurantMenu>>(`/restaurantes/${id}`),
}
