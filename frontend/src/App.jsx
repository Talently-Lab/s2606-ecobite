import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// Si ya hay sesión, login y registro redirigen al inicio.
function GuestOnly({ children }) {
  const { usuario, loading } = useAuth()
  if (loading) return null
  return usuario ? <Navigate to="/" replace /> : children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <GuestOnly>
                <Login />
              </GuestOnly>
            }
          />
          <Route
            path="/registro"
            element={
              <GuestOnly>
                <Register />
              </GuestOnly>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
