import { lazy } from 'react'

// API pública de la feature auth. El resto de la app importa solo desde acá.
export { AuthProvider } from './context/AuthProvider'
export { useAuth } from './hooks/useAuth'
export const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
export const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
)
export { GuestRoute } from './routes/GuestRoute'
export { ProtectedRoute } from './routes/ProtectedRoute'
export type { Rol, Usuario } from './types'
