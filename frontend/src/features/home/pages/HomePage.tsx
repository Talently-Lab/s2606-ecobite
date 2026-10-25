import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { ROUTES } from '@/shared/config/routes'

export function HomePage() {
  const { usuario, loading, logout } = useAuth()

  const [categoria, setCategoria] = useState('Todos')

  const categories = ['Todos', 'Pizza', 'Vegano', 'Postres'].map((label) => ({
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

  const restaurants = [] // reemplazar por tus datos: { id, name, rating, detail, bici, electrico, envase, local }
  const countLabel = `${restaurants.length} locales disponibles`
  const empty = restaurants.length === 0

  return (
    <div>
      <main style={{ minHeight: '100vh', background: '#F7F5EF', color: '#1E2B22', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '16px', lineHeight: '1.5' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E5DD' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
            <a href="#" aria-label="EcoBite, inicio" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/_blob/57ab39449d265a398f1ef065363d2d49" alt="" style={{ height: '44px', width: 'auto' }} />
              <img src="/_blob/5ce0b397a4628dd6b5d767a01c17a9b8" alt="EcoBite" style={{ height: '30px', width: 'auto' }} />
            </a>
            <label style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: '10px', background: '#EEF0EA', borderRadius: '999px', padding: '0 18px', minHeight: '48px', boxSizing: 'border-box' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: '#5A6B5E', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Buscar</span>
              <input type="search" placeholder="Buscar restaurantes o platos" style={{ flex: '1', border: '0', background: 'transparent', font: 'inherit', color: '#1E2B22', outline: 'none', minWidth: '0' }} />
            </label>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <a href="Impacto.dc.html" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '14px', textDecoration: 'none', color: '#436844' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
                Mi impacto
              </a>
              <a href="Login.dc.html" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '14px', textDecoration: 'none', color: '#1E2B22' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: '#5A6B5E', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Ingresar
              </a>
              <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#436844', color: '#FFFFFF', textDecoration: 'none', fontWeight: '600', fontSize: '16px', padding: '12px 22px', borderRadius: '999px', minHeight: '48px', boxSizing: 'border-box' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
                Carrito · 0
              </a>
            </nav>
          </div>
        </header>

        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '56px' }}>
          <div style={{ flex: '1 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#BBDB9B', color: '#24402A', fontWeight: '500', fontSize: '14px', padding: '6px 14px 6px 12px', borderRadius: '999px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
              Delivery 100% sustentable
            </span>
            <h1 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: '1.1', letterSpacing: '-0.02em', maxWidth: '620px' }}>Comida rica, entregada sin emisiones</h1>
            <p style={{ margin: '0', fontSize: '18px', lineHeight: '1.6', color: '#5A6B5E', maxWidth: '540px' }}>Restaurantes con envases compostables y reparto en bici o eléctrico. En cada pedido te mostramos cuánto CO₂ ahorrás.</p>
            <form style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', background: '#FFFFFF', borderRadius: '999px', padding: '8px 8px 8px 20px', boxShadow: '0 8px 24px rgb(30 43 34 / 0.10)', maxWidth: '560px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: '#436844', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <label htmlFor="barrio" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Tu barrio</label>
              <input id="barrio" placeholder="Ingresá tu barrio (ej: Palermo)" style={{ flex: '1 1 180px', minWidth: '0', border: '0', font: 'inherit', color: '#1E2B22', outline: 'none', background: 'transparent', minHeight: '44px' }} />
              <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#436844', color: '#FFFFFF', border: '0', font: '600 16px "Inter", sans-serif', padding: '12px 22px', borderRadius: '999px', minHeight: '48px', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                Ver locales
              </button>
            </form>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', fontSize: '14px', fontWeight: '500', color: '#5A6B5E' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: '#436844', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path></svg>Reparto en bici o eléctrico</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: '#436844', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="M3.29 7 12 12 20.71 7"></path></svg>Envases compostables</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: '#436844', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>Impacto medido en cada pedido</span>
            </div>
          </div>

          <div style={{ flex: '1 1 380px', minWidth: '0', display: 'flex', justifyContent: 'center', position: 'relative', padding: '40px 0' }}>
            <div style={{ position: 'absolute', width: '420px', height: '420px', maxWidth: '100%', borderRadius: '50%', background: '#BBDB9B', opacity: '0.5', top: '0', left: '50%', transform: 'translateX(-45%)' }}></div>
            <div style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', background: '#F6E8DE', top: '8px', right: '0' }}></div>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px', boxSizing: 'border-box', background: '#436844', color: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 16px 48px rgb(30 43 34 / 0.14)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', background: '#BBDB9B', opacity: '0.16', top: '-90px', right: '-70px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', color: '#BBDB9B' }}>NUESTRO IMPACTO</span>
                <span style={{ display: 'inline-flex', background: '#F7F5EF', borderRadius: '999px', padding: '8px 10px' }}><img src="/_blob/57ab39449d265a398f1ef065363d2d49" alt="" style={{ height: '40px', width: 'auto' }} /></span>
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '64px', lineHeight: '1', letterSpacing: '-0.03em' }}>[X.XXX] kg</div>
              <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.5' }}>de CO₂ ahorrados por la comunidad EcoBite frente a delivery en moto</p>
              <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#BBDB9B', color: '#24402A', fontWeight: '500', fontSize: '14px', padding: '8px 14px 8px 12px', borderRadius: '999px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"></path><path d="M7 16v6"></path><path d="M13 19v3"></path><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"></path></svg>
                Equivale a [N] árboles plantados
              </span>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '24px', lineHeight: '1.3' }}>¿Qué tenés ganas de comer?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {categories.map((cat) => (
              <button key={cat.label} type="button" onClick={cat.pick} aria-pressed={cat.pressed} style={cat.style}>{cat.label}</button>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 72px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '32px', lineHeight: '1.25', letterSpacing: '-0.01em' }}>Restaurantes cerca tuyo</h2>
              <p style={{ margin: '0', color: '#5A6B5E' }}>{countLabel}</p>
            </div>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600', textDecoration: 'none', padding: '12px 8px', minHeight: '44px', boxSizing: 'border-box' }}>Ver todos
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {restaurants.map((r) => (
              <a key={r.id} href="Local.dc.html" style={{ flex: '1 1 260px', maxWidth: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 2px rgb(30 43 34 / 0.06), 0 1px 3px rgb(30 43 34 / 0.08)', textDecoration: 'none', color: '#1E2B22' }}>
                <div style={{ height: '168px', background: '#E3ECE0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#436844', fontSize: '12px', fontWeight: '500' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 3 2h3Zm0 0v7"></path></svg>
                  [Foto del local]
                </div>
                <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ flex: '1', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px', lineHeight: '1.4' }}>{r.name}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500', fontSize: '14px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ stroke: '#9E5A30', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
                      {r.rating}
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', color: '#5A6B5E' }}>{r.detail}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {r.bici && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E3ECE0', color: '#436844', fontSize: '12px', fontWeight: '500', padding: '5px 12px 5px 10px', borderRadius: '999px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path></svg>Reparto en bici</span>
                    )}
                    {r.electrico && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E3ECE0', color: '#436844', fontSize: '12px', fontWeight: '500', padding: '5px 12px 5px 10px', borderRadius: '999px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>Vehículo eléctrico</span>
                    )}
                    {r.envase && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E3ECE0', color: '#436844', fontSize: '12px', fontWeight: '500', padding: '5px 12px 5px 10px', borderRadius: '999px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="M3.29 7 12 12 20.71 7"></path></svg>Envase compostable</span>
                    )}
                    {r.local && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E3ECE0', color: '#436844', fontSize: '12px', fontWeight: '500', padding: '5px 12px 5px 10px', borderRadius: '999px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>Productores locales</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
            {empty && (
              <div style={{ flex: '1 1 100%', background: '#FFFFFF', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#5A6B5E' }}>Todavía no hay locales en esta categoría. Probá con otra.</div>
            )}
          </div>
        </section>

        <section style={{ background: '#FFFFFF' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '32px', lineHeight: '1.25', letterSpacing: '-0.01em', textAlign: 'center' }}>Pedir rico y cuidar el planeta es igual de fácil</h2>
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ flex: '1 1 280px', background: '#F7F5EF', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#BBDB9B', color: '#24402A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path></svg></span>
                <h3 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px' }}>1. Elegí un local eco</h3>
                <p style={{ margin: '0', color: '#5A6B5E' }}>Todos usan envases compostables y reparten sin emisiones.</p>
              </div>
              <div style={{ flex: '1 1 280px', background: '#F7F5EF', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#BBDB9B', color: '#24402A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg></span>
                <h3 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px' }}>2. Pedí como siempre</h3>
                <p style={{ margin: '0', color: '#5A6B5E' }}>Armá tu pedido y confirmalo en un par de clics.</p>
              </div>
              <div style={{ flex: '1 1 280px', background: '#F7F5EF', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#BBDB9B', color: '#24402A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }} aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg></span>
                <h3 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px' }}>3. Mirá tu impacto</h3>
                <p style={{ margin: '0', color: '#5A6B5E' }}>Te mostramos el CO₂ que ahorraste y lo vas sumando pedido a pedido.</p>
              </div>
            </div>
          </div>
        </section>

        <footer style={{ background: '#E3ECE0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/_blob/57ab39449d265a398f1ef065363d2d49" alt="" style={{ height: '40px', width: 'auto' }} />
              <img src="/_blob/5ce0b397a4628dd6b5d767a01c17a9b8" alt="EcoBite" style={{ height: '26px', width: 'auto' }} />
            </span>
            <p style={{ margin: '0', flex: '1 1 260px', fontSize: '14px', color: '#5A6B5E' }}>Delivery sustentable · Proyecto Talently Lab S2606 · © 2026 EcoBite</p>
            <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', fontSize: '14px', fontWeight: '500' }}>
              <a href="#" style={{ textDecoration: 'none', padding: '12px 0' }}>Cómo calculamos el CO₂</a>
              <a href="#" style={{ textDecoration: 'none', padding: '12px 0' }}>Sumá tu local</a>
              <a href="#" style={{ textDecoration: 'none', padding: '12px 0' }}>Contacto</a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  )
}