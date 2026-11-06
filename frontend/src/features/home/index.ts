import { lazy } from 'react'

export type { Restaurant, FeaturedDish } from './types'
export const HomePage = lazy(() => import('./pages/HomePage').then(({ HomePage }) => ({ default: HomePage })))
export { useHome } from './hooks/useHome'
