import { lazy } from 'react'

export type { Restaurant, FeaturedDish } from './types'
export const HomePage = lazy(() => import('./pages/HomePage').then(({ HomePage }) => ({ default: HomePage })))
export const RestaurantMapPage = lazy(() =>
  import('./pages/RestaurantMapPage').then(({ RestaurantMapPage }) => ({ default: RestaurantMapPage })),
)
export { useHome } from './hooks/useHome'

export { requestCurrentPosition } from './services/routeService'
