import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, LoginPage, ProtectedRoute, RegisterPage } from '@/features/auth'
import { MethodologyPage, JoinPage, ContactPage } from '@/features/information'
import { HomePage, RestaurantMapPage } from '@/features/home'
import { RestaurantCatalogPage, RestaurantMenuPage } from '@/features/catalog'
import { CheckoutPage, OrderConfirmationPage, ImpactPage, AdminDashboardPage } from '@/features/panel'
import { ROUTES } from '@/shared/config/routes'

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center text-musgo">
          Cargando página…
        </p>
      }
    >
      <Routes>
        <Route
          path={ROUTES.home}
          element={
            <Suspense
              fallback={
                <p role="status" className="p-8 text-center text-musgo">
                  Cargando inicio…
                </p>
              }
            >
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.map}
          element={
            <Suspense
              fallback={
                <p role="status" className="p-8 text-center text-musgo">
                  Cargando mapa…
                </p>
              }
            >
              <RestaurantMapPage />
            </Suspense>
          }
        />
        <Route path={ROUTES.methodology} element={<MethodologyPage />} />
        <Route path={ROUTES.join} element={<JoinPage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route path={ROUTES.restaurants} element={<RestaurantCatalogPage />} />
        <Route path="/panel" element={<Navigate to={ROUTES.restaurants} replace />} />
        <Route path={ROUTES.restaurantMenu} element={<RestaurantMenuPage />} />
        <Route element={<GuestRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.checkout} element={<CheckoutPage />} />
          <Route path={ROUTES.orderConfirmation} element={<OrderConfirmationPage />} />
          <Route path={ROUTES.impact} element={<ImpactPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path={ROUTES.admin} element={<AdminDashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  )
}
