import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  UserRound,
  UserPlus,
  X,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Logo } from './Logo'
import { cartDrafts, useOrders } from '@/shared/lib/orderDraft'
import { ROUTES } from '@/shared/config/routes'

interface SiteHeaderProps {
  restaurantId?: number
  onCartOpen?: () => void
}

export function SiteHeader({ onCartOpen, restaurantId }: SiteHeaderProps) {
  const location = useLocation()
  // Route changes close disclosures, including browser back/forward navigation.
  return <HeaderNavigation key={location.key} onCartOpen={onCartOpen} restaurantId={restaurantId} />
}

function HeaderNavigation({ onCartOpen, restaurantId }: SiteHeaderProps) {
  const { usuario, logout } = useAuth()
  const orders = useOrders()
  const cartCount = cartDrafts(orders)
    .filter((draft) => restaurantId === undefined || draft.restaurantId === restaurantId)
    .reduce((sum, draft) => sum + Object.values(draft.items).reduce((a, b) => a + b, 0), 0)
  const [menu, setMenu] = useState<'navigation' | 'account' | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const accountRef = useRef<HTMLButtonElement>(null)
  const navigationRef = useRef<HTMLButtonElement>(null)
  const linksRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!menu) return
    if (menu === 'navigation') linksRef.current?.querySelector('a')?.focus()
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenu(null)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenu(null)
      ;(menu === 'account' ? accountRef : navigationRef).current?.focus()
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [menu])

  return (
    <header
      ref={headerRef}
      className="site-header"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setMenu(null)
      }}
    >
      <div className="site-header-inner">
        <Link className="site-header-logo" to={ROUTES.home} aria-label="EcoBite, inicio">
          <Logo />
        </Link>
        <nav
          ref={linksRef}
          id="site-navigation"
          aria-label="Navegación principal"
          className={`site-nav ${menu === 'navigation' ? 'is-open' : ''}`}
        >
          <NavLink to={ROUTES.home} end>
            Inicio
          </NavLink>
          <NavLink to={ROUTES.restaurants}>Restaurantes</NavLink>
          <NavLink to={ROUTES.map}>Mapa</NavLink>
          <NavLink to={ROUTES.methodology}>Nuestro impacto</NavLink>
        </nav>
        <div className="site-header-actions">
          {onCartOpen ? (
            <button
              type="button"
              className="header-icon header-cart"
              aria-label={`Ver carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}
              onClick={() => {
                setMenu(null)
                onCartOpen()
              }}
            >
              <ShoppingCart size={23} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="header-cart-count" aria-hidden="true">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          ) : (
            <Link
              className="header-icon header-cart"
              to={`${ROUTES.restaurants}?carrito=1`}
              aria-label={`Ver carrito, ${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}
            >
              <ShoppingCart size={23} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="header-cart-count" aria-hidden="true">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          )}
          <div
            className="header-account"
            onBlur={(event) => {
              if (menu === 'account' && !event.currentTarget.contains(event.relatedTarget)) setMenu(null)
            }}
          >
            <button
              ref={accountRef}
              className="header-icon"
              type="button"
              aria-label="Mi cuenta"
              title="Mi cuenta"
              aria-expanded={menu === 'account'}
              aria-controls="account-navigation"
              onClick={() => setMenu(menu === 'account' ? null : 'account')}
            >
              <UserRound size={23} aria-hidden="true" />
              <ChevronDown size={12} aria-hidden="true" />
            </button>
            {menu === 'account' && (
              <nav id="account-navigation" className="account-dropdown" aria-label="Opciones de cuenta">
                {usuario ? (
                  <>
                    <p className="account-greeting">
                      Hola, <strong>{usuario.nombre}</strong>
                    </p>
                    <Link to={ROUTES.impact}>
                      <Leaf size={18} aria-hidden="true" />
                      Mi impacto
                    </Link>
                    {usuario.rol === 'admin' && (
                      <Link to={ROUTES.admin}>
                        <Settings size={18} aria-hidden="true" />
                        Administración
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setMenu(null)
                        accountRef.current?.focus()
                      }}
                    >
                      <LogOut size={18} aria-hidden="true" />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link to={ROUTES.login}>
                      <LogIn size={18} aria-hidden="true" />
                      Ingresar
                    </Link>
                    <Link to={ROUTES.register}>
                      <UserPlus size={18} aria-hidden="true" />
                      Crear cuenta
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>
          <button
            ref={navigationRef}
            className="header-icon nav-toggle"
            type="button"
            aria-expanded={menu === 'navigation'}
            aria-controls="site-navigation"
            aria-label={menu === 'navigation' ? 'Cerrar navegación' : 'Abrir navegación'}
            onClick={() => setMenu(menu === 'navigation' ? null : 'navigation')}
          >
            {menu === 'navigation' ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
