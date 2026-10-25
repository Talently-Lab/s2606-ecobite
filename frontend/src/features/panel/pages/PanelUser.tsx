import { useState } from 'react'

const SECTION_NAMES = ['Todos', 'Bowls', 'Ensaladas', 'Bebidas']

// Datos de ejemplo: reemplazar por los reales
const MENU = [
  { id: 1, section: 'Bowls', name: 'Bowl de quinoa', desc: 'Quinoa, palta, garbanzos y vegetales de estación.', price: 8500 },
  { id: 2, section: 'Bowls', name: 'Bowl de falafel', desc: 'Falafel, hummus, pepino y salsa de yogur.', price: 9200 },
  { id: 3, section: 'Ensaladas', name: 'Ensalada de estación', desc: 'Hojas verdes, tomate, zanahoria y semillas.', price: 7400 },
  { id: 4, section: 'Bebidas', name: 'Limonada de jengibre', desc: 'Limón exprimido, jengibre y menta.', price: 3200 },
]

const SHIPPING = 1500
const CO2_PER_ITEM_KG = 0.4 // valor de ejemplo hasta que Data defina la fórmula

const formatPrice = (n) => `$${n.toLocaleString('es-AR')}`

export function PanelUser() {
  const [section, setSection] = useState('Todos')
  const [cart, setCart] = useState({}) // { [dishId]: cantidad }

  const changeQty = (id, delta) =>
    setCart((prev) => {
      const next = { ...prev }
      const qty = (next[id] || 0) + delta
      if (qty <= 0) delete next[id]
      else next[id] = qty
      return next
    })

  const sections = SECTION_NAMES.map((label) => ({
    label,
    pressed: section === label,
    pick: () => setSection(label),
    style: {
      border: '0',
      cursor: 'pointer',
      font: '500 14px "Inter", sans-serif',
      padding: '10px 18px',
      minHeight: '44px',
      borderRadius: '999px',
      background: section === label ? '#436844' : '#FFFFFF',
      color: section === label ? '#FFFFFF' : '#1E2B22',
    },
  }))

  const dishes = MENU.filter((d) => section === 'Todos' || d.section === section).map((d) => ({
    ...d,
    priceLabel: formatPrice(d.price),
    qty: cart[d.id] || 0,
    inCart: !!cart[d.id],
    notInCart: !cart[d.id],
    add: () => changeQty(d.id, 1),
    addLabel: `Agregar ${d.name} al pedido`,
  }))

  const cartItems = MENU.filter((d) => cart[d.id]).map((d) => ({
    name: d.name,
    qty: cart[d.id],
    lineLabel: formatPrice(d.price * cart[d.id]),
    dec: () => changeQty(d.id, -1),
    inc: () => changeQty(d.id, 1),
    decLabel: `Quitar una unidad de ${d.name}`,
    incLabel: `Agregar una unidad de ${d.name}`,
  }))

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartEmpty = cartCount === 0
  const cartFull = !cartEmpty
  const subtotal = MENU.reduce((sum, d) => sum + d.price * (cart[d.id] || 0), 0)
  const subtotalLabel = formatPrice(subtotal)
  const shippingLabel = formatPrice(SHIPPING)
  const totalLabel = formatPrice(subtotal + SHIPPING)
  const co2Label = `${(cartCount * CO2_PER_ITEM_KG).toFixed(1).replace('.', ',')} kg`

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5EF', color: '#1E2B22', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '16px', lineHeight: '1.5' }}>
      {/* Navbar */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E5DD' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
          <a href="Main.dc.html" aria-label="EcoBite, inicio" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/_blob/57ab39449d265a398f1ef065363d2d49" alt="" style={{ height: '44px', width: 'auto' }} />
            <img src="/_blob/5ce0b397a4628dd6b5d767a01c17a9b8" alt="EcoBite" style={{ height: '30px', width: 'auto' }} />
          </a>
          <label style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: '10px', background: '#EEF0EA', borderRadius: '999px', padding: '0 18px', minHeight: '48px', boxSizing: 'border-box' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A6B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Buscar</span>
            <input type="search" placeholder="Buscar restaurantes o platos" style={{ flex: '1', border: '0', background: 'transparent', font: 'inherit', color: '#1E2B22', outline: 'none', minWidth: '0' }} />
          </label>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="Impacto.dc.html" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '14px', textDecoration: 'none', color: '#436844' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
              Mi impacto
            </a>
            <a href="Login.dc.html" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '14px', textDecoration: 'none', color: '#1E2B22' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A6B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Ingresar
            </a>
            <a href="#carrito" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#436844', color: '#FFFFFF', textDecoration: 'none', fontWeight: '600', fontSize: '16px', padding: '12px 22px', borderRadius: '999px', minHeight: '48px', boxSizing: 'border-box' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
              Carrito · {cartCount}
            </a>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 72px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Ruta" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#5A6B5E' }}>
          <a href="Main.dc.html" style={{ textDecoration: 'none', fontWeight: '500', padding: '10px 0' }}>Inicio</a>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
          <span>Verde Bowl</span>
        </nav>

        {/* Cabecera del local */}
        <section style={{ background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 1px 2px rgb(30 43 34 / 0.06), 0 1px 3px rgb(30 43 34 / 0.08)' }}>
          <div style={{ height: '220px', background: '#E3ECE0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#436844', fontSize: '13px', fontWeight: '500' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 3 2h3Zm0 0v7"></path></svg>
            [Foto de portada del local]
          </div>
          <div style={{ padding: '28px 32px 32px', display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 420px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h1 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '40px', lineHeight: '1.2', letterSpacing: '-0.015em' }}>Verde Bowl</h1>
              <p style={{ margin: '0', color: '#5A6B5E' }}>Bowls y ensaladas de estación · Palermo, CABA</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: '14px', fontWeight: '500' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9E5A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>4,8</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5A6B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>25–35 min</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5A6B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>A [X] km de tu zona</span>
              </div>
            </div>

            {/* Por qué es eco (EB-03) */}
            <div style={{ flex: '1 1 380px', minWidth: '0', background: '#EEF6E4', borderRadius: '16px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#436844" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
                <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '18px' }}>¿Por qué este local es eco?</h2>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ flex: 'none', width: '36px', height: '36px', borderRadius: '10px', background: '#FFFFFF', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path></svg></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#24402A' }}>Reparto en bici</span>
                  <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Los envíos no usan combustible: no hay emisiones de escape en el trayecto.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ flex: 'none', width: '36px', height: '36px', borderRadius: '10px', background: '#FFFFFF', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="M3.29 7 12 12 20.71 7"></path></svg></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#24402A' }}>Envase compostable</span>
                  <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Todos los envases son compostables. [Certificación del envase].</span>
                </div>
              </div>
              <a href="#" style={{ fontSize: '14px', fontWeight: '600', textDecoration: 'none', padding: '6px 0' }}>Cómo calculamos el CO₂ →</a>
            </div>
          </div>
        </section>

        {/* Menú + carrito */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
          <section style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '28px', lineHeight: '1.3' }}>Menú</h2>
              <div role="group" aria-label="Secciones del menú" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {sections.map((s) => (
                  <button key={s.label} type="button" onClick={s.pick} aria-pressed={s.pressed} style={s.style}>{s.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dishes.map((d) => (
                <article key={d.id} style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E5DD', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h3 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '18px', lineHeight: '1.4' }}>{d.name}</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#5A6B5E' }}>{d.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '18px', color: '#9E5A30' }}>{d.priceLabel}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#BBDB9B', color: '#24402A', fontSize: '12px', fontWeight: '500', padding: '5px 12px 5px 10px', borderRadius: '999px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="M3.29 7 12 12 20.71 7"></path></svg>Envase compostable</span>
                    </div>
                  </div>
                  <div style={{ flex: 'none', position: 'relative', width: '120px', height: '120px' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '12px', background: '#E3ECE0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#436844', fontSize: '11px', fontWeight: '500', textAlign: 'center' }}>[Foto del plato]</div>
                    {d.notInCart && (
                      <button type="button" onClick={d.add} aria-label={d.addLabel} style={{ position: 'absolute', right: '-8px', bottom: '-8px', width: '44px', height: '44px', borderRadius: '50%', border: '0', background: '#436844', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgb(30 43 34 / 0.18)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                      </button>
                    )}
                    {d.inCart && (
                      <span style={{ position: 'absolute', right: '-8px', bottom: '-8px', minWidth: '44px', height: '44px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '999px', background: '#24402A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: '600', fontSize: '14px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>{d.qty}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Carrito lateral */}
          <aside id="carrito" aria-label="Tu pedido" style={{ flex: '1 1 340px', minWidth: '0', maxWidth: '100%', background: '#FFFFFF', borderRadius: '24px', padding: '24px', boxSizing: 'border-box', boxShadow: '0 8px 24px rgb(30 43 34 / 0.10)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '24px', lineHeight: '1.3' }}>Tu pedido</h2>
              <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Verde Bowl · 25–35 min</span>
            </div>

            {cartEmpty && (
              <div style={{ background: '#F7F5EF', borderRadius: '16px', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
                <span style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E3ECE0', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg></span>
                <span style={{ fontWeight: '600' }}>Tu carrito está vacío</span>
                <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Agregá platos y mirá cuánto CO₂ ahorrás con tu pedido.</span>
              </div>
            )}

            {cartFull && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {cartItems.map((c) => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{c.name}</span>
                        <span style={{ fontSize: '14px', color: '#5A6B5E' }}>{c.lineLabel}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#EEF0EA', borderRadius: '999px', padding: '4px' }}>
                        <button type="button" onClick={c.dec} aria-label={c.decLabel} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '0', background: '#FFFFFF', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"></path></svg></button>
                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '500', fontSize: '14px' }} aria-live="polite">{c.qty}</span>
                        <button type="button" onClick={c.inc} aria-label={c.incLabel} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '0', background: '#436844', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ height: '1px', background: '#E2E5DD' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5A6B5E' }}><span>Subtotal</span><span style={{ color: '#1E2B22' }}>{subtotalLabel}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5A6B5E' }}><span>Envío en bici</span><span style={{ color: '#1E2B22' }}>{shippingLabel}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px', paddingTop: '4px' }}><span>Total</span><span>{totalLabel}</span></div>
                </div>

                {/* Impacto del pedido (EB-09) */}
                <div style={{ background: '#EEF6E4', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ flex: 'none', color: '#436844', paddingTop: '2px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg></span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: '#24402A' }}>Ahorrás {co2Label} de CO₂</span>
                    <span style={{ fontSize: '13px', color: '#5A6B5E' }}>vs. el mismo pedido entregado en moto. Valor de ejemplo hasta que Data defina la fórmula.</span>
                  </div>
                </div>

                <a href="Checkout.dc.html" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#436844', color: '#FFFFFF', textDecoration: 'none', fontWeight: '600', fontSize: '16px', padding: '14px 22px', borderRadius: '999px', minHeight: '52px', boxSizing: 'border-box' }}>
                  Ir a pagar
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
                </a>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}