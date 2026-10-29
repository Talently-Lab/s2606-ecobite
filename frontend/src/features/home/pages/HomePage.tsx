import { SiteFooter } from '@/shared/components/SiteFooter'
import { Bike, ChartColumn, ChevronRight, Leaf, MapPin, Package, Search, ShoppingCart, Store, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { Alert } from '@/shared/components/ui'
import isotipo from '@/shared/assets/logo-isotipo.png'
import wordmark from '@/shared/assets/logo-wordmark.png'
import { useHome } from '../hooks/useHome'
import { ROUTES, restaurantMenuUrl } from '@/shared/config/routes'

export function HomePage() {
  const { usuario, logout } = useAuth()
  const { data, loading, error } = useHome()

  const [categoria, setCategoria] = useState('Todos')

  const categories = ['Todos', ...(data?.categories.map((category) => category.name) ?? [])].map((label) => ({
    label,
    pressed: categoria === label,
    pick: () => setCategoria(label),
    style: {
      border: '0',
      cursor: 'pointer',
      font: '500 14px "Inter", sans-serif',
      padding: '10px 18px',
      minHeight: '44px',
      borderRadius: '999px',
      background: categoria === label ? '#436844' : '#FFFFFF',
      color: categoria === label ? '#FFFFFF' : '#1E2B22',
    },
  }))

  const restaurants = data?.restaurants ?? []
  const dishes = (data?.featuredDishes ?? []).filter(
    (dish) => categoria === 'Todos' || dish.category === categoria,
  )
  const countLabel = `${restaurants.length} locales disponibles`
  const empty = !loading && !error && restaurants.length === 0

  return (
    <div>
      <main
        style={{
          minHeight: '100vh',
          background: '#F7F5EF',
          color: '#1E2B22',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '16px',
          lineHeight: '1.5',
        }}
      >
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E5DD' }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '14px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <a
              href="#"
              aria-label="EcoBite, inicio"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
            >
              <img src={isotipo} alt="" style={{ height: '44px', width: 'auto' }} />
              <img src={wordmark} alt="EcoBite" style={{ height: '30px', width: 'auto' }} />
            </a>
            <Link to={ROUTES.restaurants} className="flex min-h-12 flex-1 items-center rounded-full bg-arena px-5">Buscar restaurantes</Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <a
                href="#impacto"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '500',
                  fontSize: '14px',
                  textDecoration: 'none',
                  color: '#436844',
                }}
              >
                <Leaf size={20} aria-hidden="true" />
                Mi impacto
              </a>
              {usuario ? (
                <span>{usuario.nombre}</span>
              ) : (
                <Link
                  to={ROUTES.login}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '500',
                    fontSize: '14px',
                    textDecoration: 'none',
                    color: '#1E2B22',
                  }}
                >
                  <UserRound size={20} color="#5A6B5E" aria-hidden="true" />
                  Ingresar
                </Link>
              )}
              {usuario && (
                <button type="button" onClick={logout}>
                  Cerrar sesión
                </button>
              )}
              <Link
                to={ROUTES.restaurants}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#436844',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  padding: '12px 22px',
                  borderRadius: '999px',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              >
                <ShoppingCart size={20} aria-hidden="true" />
                Explorar restaurantes
              </Link>
            </nav>
          </div>
        </header>

        {loading && <p role="status">Cargando Home…</p>}
        {error && <Alert>{error}</Alert>}

        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '72px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '56px',
          }}
        >
          <div
            style={{
              flex: '1 1 520px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <span
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#BBDB9B',
                color: '#24402A',
                fontWeight: '500',
                fontSize: '14px',
                padding: '6px 14px 6px 12px',
                borderRadius: '999px',
              }}
            >
              <Leaf size={16} aria-hidden="true" />
              Delivery 100% sustentable
            </span>
            <h1
              style={{
                margin: '0',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: '700',
                fontSize: 'clamp(40px, 5vw, 60px)',
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                maxWidth: '620px',
              }}
            >
              Comida rica, entregada sin emisiones
            </h1>
            <p
              style={{
                margin: '0',
                fontSize: '18px',
                lineHeight: '1.6',
                color: '#5A6B5E',
                maxWidth: '540px',
              }}
            >
              Restaurantes con envases compostables y reparto en bici o eléctrico. En cada pedido te mostramos
              cuánto CO₂ ahorrás.
            </p>
            <form
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                borderRadius: '999px',
                padding: '8px 8px 8px 20px',
                boxShadow: '0 8px 24px rgb(30 43 34 / 0.10)',
                maxWidth: '560px',
              }}
            >
              <MapPin size={20} color="#436844" aria-hidden="true" />
              <label
                htmlFor="barrio"
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)',
                }}
              >
                Tu barrio
              </label>
              <input
                id="barrio"
                placeholder="Ingresá tu barrio (ej: Palermo)"
                style={{
                  flex: '1 1 180px',
                  minWidth: '0',
                  border: '0',
                  font: 'inherit',
                  color: '#1E2B22',
                  outline: 'none',
                  background: 'transparent',
                  minHeight: '44px',
                }}
              />
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#436844',
                  color: '#FFFFFF',
                  border: '0',
                  font: '600 16px "Inter", sans-serif',
                  padding: '12px 22px',
                  borderRadius: '999px',
                  minHeight: '48px',
                  cursor: 'pointer',
                }}
              >
                <Search size={20} aria-hidden="true" />
                Ver locales
              </button>
            </form>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#5A6B5E',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Bike size={18} color="#436844" aria-hidden="true" />
                Reparto en bici o eléctrico
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Package size={18} color="#436844" aria-hidden="true" />
                Envases compostables
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ChartColumn size={18} color="#436844" aria-hidden="true" />
                Impacto medido en cada pedido
              </span>
            </div>
          </div>

          <div
            style={{
              flex: '1 1 380px',
              minWidth: '0',
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              padding: '40px 0',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '420px',
                height: '420px',
                maxWidth: '100%',
                borderRadius: '50%',
                background: '#BBDB9B',
                opacity: '0.5',
                top: '0',
                left: '50%',
                transform: 'translateX(-45%)',
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: '#F6E8DE',
                top: '8px',
                right: '0',
              }}
            ></div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                boxSizing: 'border-box',
                background: '#436844',
                color: '#FFFFFF',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 16px 48px rgb(30 43 34 / 0.14)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '260px',
                  height: '260px',
                  borderRadius: '50%',
                  background: '#BBDB9B',
                  opacity: '0.16',
                  top: '-90px',
                  right: '-70px',
                }}
              ></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', color: '#BBDB9B' }}
                >
                  TU IMPACTO
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    background: '#F7F5EF',
                    borderRadius: '999px',
                    padding: '8px 10px',
                  }}
                >
                  <img src={isotipo} alt="" style={{ height: '40px', width: 'auto' }} />
                </span>
              </div>
              <div id="impacto"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: '700',
                  fontSize: '64px',
                  lineHeight: '1',
                  letterSpacing: '-0.03em',
                }}
              >
                {data?.userImpact != null ? `${data.userImpact.co2SavedKg.toLocaleString('es-AR')} kg` : '—'}
              </div>
              <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.5' }}>
                {data?.userImpact != null
                  ? 'de CO₂ ahorrados en tus pedidos'
                  : 'Ingresá para consultar tu CO₂ ahorrado'}
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '8px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h2
            style={{
              margin: '0',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: '600',
              fontSize: '24px',
              lineHeight: '1.3',
            }}
          >
            ¿Qué tenés ganas de comer?
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {categories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={cat.pick}
                aria-pressed={cat.pressed}
                style={cat.style}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '32px 24px 72px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2
                style={{
                  margin: '0',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: '600',
                  fontSize: '32px',
                  lineHeight: '1.25',
                  letterSpacing: '-0.01em',
                }}
              >
                Restaurantes cerca tuyo
              </h2>
              <p style={{ margin: '0', color: '#5A6B5E' }}>
                {loading ? 'Cargando locales…' : error ? 'Locales no disponibles' : countLabel}
              </p>
            </div>
            <Link
              to={ROUTES.restaurants}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '12px 8px',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            >
              Ver todos
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.id}
                style={{ flex: '1 1 260px', background: '#FFFFFF', borderRadius: '16px', padding: '24px' }}
              >
                <h3><Link to={restaurantMenuUrl(restaurant.id)}>{restaurant.name}</Link></h3>
                <p>{restaurant.address}</p>
                <p>{restaurant.ecoIndicator}</p>
                {restaurant.biodegradablePackaging && <span>Envase biodegradable</span>}
              </article>
            ))}
            {empty && (
              <div
                style={{
                  flex: '1 1 100%',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#5A6B5E',
                }}
              >
                Todavía no hay locales disponibles.
              </div>
            )}
          </div>
        </section>

        {data && (
          <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 72px' }}>
            <h2>Platos destacados</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              {dishes.map((dish) => (
                <article
                  key={dish.id}
                  style={{ flex: '1 1 260px', background: '#FFFFFF', borderRadius: '16px', padding: '24px' }}
                >
                  <h3><Link to={restaurantMenuUrl(dish.restaurant.id)}>{dish.name}</Link></h3>
                  <p>{dish.restaurant.name}</p>
                  {dish.category && <p>{dish.category}</p>}
                  <p>$ {dish.price.toLocaleString('es-AR')}</p>
                  <p>{dish.co2SavedPerUnit.toLocaleString('es-AR')} kg de CO₂ ahorrados por unidad</p>
                </article>
              ))}
              {dishes.length === 0 && <p>No hay platos destacados en esta categoría.</p>}
            </div>
          </section>
        )}

        <section style={{ background: '#FFFFFF' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '32px', lineHeight: '1.25', letterSpacing: '-0.01em', textAlign: 'center' }}>Pedir rico y cuidar el planeta es igual de fácil</h2>
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ flex: '1 1 280px', background: '#F7F5EF', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#BBDB9B', color: '#24402A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={28} aria-hidden="true" /></span>
                <h3 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px' }}>1. Elegí un local eco</h3>
                <p style={{ margin: '0', color: '#5A6B5E' }}>{data?.howItWorks[0]?.description ?? 'Explorá los restaurantes disponibles y conocé sus opciones.'}</p>
              </div>
              <div                   style={{ flex: '1 1 280px', background: '#F7F5EF', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}                >
                  <span style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#BBDB9B', color: '#24402A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={28} aria-hidden="true" /></span>
                <h3 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px' }}>2. Pedí como siempre                  </h3>
                  <p style={{ margin: '0', color: '#5A6B5E' }}>Armá tu pedido y confirmalo en un par de clics.</p>
              </div>
              <div style={{ flex: '1 1 280px', background: '#F7F5EF', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#BBDB9B', color: '#24402A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Leaf size={28} aria-hidden="true" /></span>
                <h3 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px' }}>3. Mirá tu impacto</h3>
                <p style={{ margin: '0', color: '#5A6B5E' }}>Te mostramos el CO₂ que ahorraste y lo vas sumando pedido a pedido.</p>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
