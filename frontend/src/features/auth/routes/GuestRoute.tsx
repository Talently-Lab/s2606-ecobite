import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { SessionLoading } from '@/shared/components/SessionLoading'
import { returnTo } from './returnTo'
import { useAuth } from '../hooks/useAuth'

/** Solo para visitantes: con sesión iniciada recupera el destino solicitado. */
export function GuestRoute() {
  const { usuario, loading } = useAuth()
  const destination = returnTo(useLocation().state)
  if (loading) return <SessionLoading />
  return usuario ? <Navigate to={destination} replace /> : <Outlet />
}
