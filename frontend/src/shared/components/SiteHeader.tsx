import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, Menu, X, Leaf } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Logo } from './Logo'
import { ROUTES } from '@/shared/config/routes'

export function SiteHeader() {
  const { usuario, logout } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to={ROUTES.home} aria-label="EcoBite, inicio">
          <Logo />
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-navigation"
          aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="site-navigation"
          aria-label="Navegación principal"
          className={`site-nav ${open ? 'is-open' : ''}`}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) setOpen(false)
          }}
        >
          <NavLink to={ROUTES.restaurants}>Restaurantes</NavLink>
          <NavLink to={ROUTES.methodology}>Nuestro impacto</NavLink>
          {usuario ? (
            <>
              <NavLink to={ROUTES.impact}>
                <Leaf size={16} aria-hidden="true" /> Mi impacto
              </NavLink>
              <span className="nav-user">Hola, {usuario.nombre}</span>
              <button
                type="button"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to={ROUTES.login}>Ingresar</Link>
          )}
          <Link className="eco-button nav-cta" to={ROUTES.restaurants}>
            Explorar restaurantes <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
