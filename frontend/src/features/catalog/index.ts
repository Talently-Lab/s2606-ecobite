import { lazy } from 'react'

export const RestaurantCatalogPage = lazy(() =>
  import('./RestaurantCatalogPage').then((module) => ({ default: module.RestaurantCatalogPage })),
)
export { catalogService, withImage } from './catalogService'
export const RestaurantMenuPage = lazy(() =>
  import('./RestaurantMenuPage').then((module) => ({ default: module.RestaurantMenuPage })),
)
export { formatPrice } from './formatPrice'
export { CatalogLayout, FoodImage, LoadingState } from './catalogComponents'
export { refreshCartMenus } from './menuCache'
