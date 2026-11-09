import { request } from '@/shared/lib/http'
import { withImage } from '@/features/catalog'
import type { HomeResponse } from '../types'

export const homeService = {
  getHome: () =>
    request<HomeResponse>('/home').then((result) => ({
      ...result,
      data: {
        ...result.data,
        featuredDishes: result.data.featuredDishes.map((dish) => withImage(dish, 'dishes')),
      },
    })),
}
