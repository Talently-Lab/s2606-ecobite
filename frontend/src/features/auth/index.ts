// API pública de la feature auth. El resto de la app importa solo desde acá.
export { AuthProvider } from './context/AuthProvider'
export { useAuth } from './hooks/useAuth'
export { LoginPage } from './pages/LoginPage'
export { RegisterPage } from './pages/RegisterPage'
export { GuestRoute } from './routes/GuestRoute'
export { ProtectedRoute } from './routes/ProtectedRoute'
export type { Rol, Usuario } from './types'
