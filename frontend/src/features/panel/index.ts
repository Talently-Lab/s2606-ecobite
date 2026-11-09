import { lazy } from 'react'

export const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })),
)
export const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage').then((module) => ({ default: module.OrderConfirmationPage })),
)
export const ImpactPage = lazy(() =>
  import('./pages/ImpactPage').then((module) => ({ default: module.ImpactPage })),
)
export const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })),
)
