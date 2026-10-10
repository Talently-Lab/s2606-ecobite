import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Placeholder hasta construir la Home del diseño.
export default function Home() {
  const { usuario, loading, logout } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-4xl font-semibold text-bosque">EcoBite</h1>
      {loading ? null : usuario ? (
        <>
          <p className="text-musgo">Hola, {usuario.nombre}. La Home está en construcción.</p>
          <button type="button" onClick={logout} className="min-h-11 font-semibold text-bosque underline">
            Cerrar sesión
          </button>
        </>
      ) : (
        <p className="text-musgo">
          <Link to="/login" className="font-semibold">
            Ingresá
          </Link>{' '}
          o{' '}
          <Link to="/registro" className="font-semibold">
            creá tu cuenta
          </Link>
          .
        </p>
      )}
    </main>
  )
}
