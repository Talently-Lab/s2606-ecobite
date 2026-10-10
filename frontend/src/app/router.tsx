import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, LoginPage, RegisterPage } from '@/features/auth'
import { HomePage } from '@/features/home'
import { ROUTES } from '@/shared/config/routes'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />

      <Route element={<GuestRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      {/* Pantallas que requieren sesión, por ejemplo:
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.impact} element={<ImpactPage />} />
      </Route> */}

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}
