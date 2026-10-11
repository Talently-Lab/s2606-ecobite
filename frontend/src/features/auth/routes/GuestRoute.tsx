import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useAuth } from '../hooks/useAuth'

/** Solo para visitantes: con sesión iniciada redirige al inicio. */
export function GuestRoute() {
  const { usuario, loading } = useAuth()
  if (loading) return null
  return usuario ? <Navigate to={ROUTES.home} replace /> : <Outlet />
}
