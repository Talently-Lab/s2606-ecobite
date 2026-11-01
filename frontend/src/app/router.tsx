import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, LoginPage, ProtectedRoute, RegisterPage } from '@/features/auth'
import { MethodologyPage, JoinPage, ContactPage } from '@/features/information'
import { HomePage } from '@/features/home'
import { RestaurantCatalogPage, RestaurantMenuPage } from '@/features/catalog'
import { CheckoutPage, ConfirmacionPedido, ImpactoPage, PanelAdmin } from '@/features/panel'
import { ROUTES } from '@/shared/config/routes'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.methodology} element={<MethodologyPage />} />
      <Route path={ROUTES.join} element={<JoinPage />} />
      <Route path={ROUTES.contact} element={<ContactPage />} />
      <Route path={ROUTES.restaurants} element={<RestaurantCatalogPage />} />
      <Route path="/panel" element={<Navigate to={ROUTES.restaurants} replace />} />
      <Route element={<GuestRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.restaurantMenu} element={<RestaurantMenuPage />} />
        <Route path={ROUTES.checkout} element={<CheckoutPage />} />
        <Route path={ROUTES.orderConfirmation} element={<ConfirmacionPedido />} />
        <Route path={ROUTES.impact} element={<ImpactoPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path={ROUTES.admin} element={<PanelAdmin />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}
