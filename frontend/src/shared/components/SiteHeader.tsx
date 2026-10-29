import { Link, NavLink } from 'react-router-dom'
import { LogIn, LogOut, Store, UserRound } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Logo } from './Logo'
import { ROUTES } from '@/shared/config/routes'

export function SiteHeader() {
  const { usuario, logout } = useAuth()
  return (
    <header className="border-b border-borde bg-crema/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link
          to={ROUTES.home}
          aria-label="EcoBite, inicio"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bosque"
        >
          <Logo />
        </Link>
        <nav
          aria-label="Navegación principal"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium"
        >
          <NavLink to={ROUTES.restaurants} className="inline-flex min-h-11 items-center gap-2">
            <Store className="size-4" aria-hidden="true" />
            Restaurantes
          </NavLink>
          <NavLink to={ROUTES.methodology} className="inline-flex min-h-11 items-center">
            Nuestro impacto
          </NavLink>
          {usuario ? (
            <>
              <span className="inline-flex items-center gap-2 text-musgo">
                <UserRound className="size-4" aria-hidden="true" />
                Hola, {usuario.nombre}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 underline underline-offset-4"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to={ROUTES.login}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-bosque px-5"
            >
              <LogIn className="size-4" aria-hidden="true" />
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
