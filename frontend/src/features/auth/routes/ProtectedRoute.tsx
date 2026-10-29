import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { SessionLoading } from '@/shared/components/SessionLoading'
import { ROUTES } from '@/shared/config/routes'
import { useAuth } from '../hooks/useAuth'
import type { Rol } from '../types'

interface ProtectedRouteProps {
  /** Si se indica, solo esos roles pueden entrar (ej. ['admin'] para el panel). */
  roles?: Rol[]
}

/** Requiere sesión. Sin sesión manda a /login y vuelve a la página pedida después de ingresar. */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { usuario, loading } = useAuth()
  const location = useLocation()

  if (loading) return <SessionLoading />
  if (!usuario)
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    )
  if (roles && !roles.includes(usuario.rol)) return <Navigate to={ROUTES.home} replace />
  return <Outlet />
}
