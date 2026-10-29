import { useState } from 'react'

// Datos de ejemplo: reemplazar por los reales
const PERIODS = [
  { id: 'mes', label: 'Este mes', eyebrow: 'AHORRADO ESTE MES', co2: 1.8, orders: 5, km: 11.2, packs: 9 },
  { id: 'total', label: 'Total', eyebrow: 'AHORRADO EN TOTAL', co2: 4.6, orders: 14, km: 31.5, packs: 26 },
]

const ORDERS = [
  { id: 1, date: '12 oct 2026', local: 'Verde Bowl', zone: 'Palermo', total: 15150, co2: 325 },
  { id: 2, date: '05 oct 2026', local: 'Verde Bowl', zone: 'Palermo', total: 12900, co2: 310 },
  { id: 3, date: '28 sep 2026', local: 'Raíz Cocina', zone: 'Recoleta', total: 18400, co2: 420 },
  { id: 4, date: '19 sep 2026', local: 'Verde Bowl', zone: 'Palermo', total: 9800, co2: 290 },
  { id: 5, date: '11 sep 2026', local: 'Raíz Cocina', zone: 'Recoleta', total: 16200, co2: 405 },
  { id: 6, date: '02 sep 2026', local: 'Verde Bowl', zone: 'Palermo', total: 11300, co2: 300 },
]

const formatPrice = (n: number) => `$ ${n.toLocaleString('es-AR')}`

const periodButtonStyle = (active: boolean) => ({
  border: '0',
  cursor: 'pointer',
  font: '500 14px "Inter", sans-serif',
  padding: '8px 16px',
  minHeight: '40px',
  borderRadius: '999px',
  background: active ? '#436844' : 'transparent',
  color: active ? '#FFFFFF' : '#1E2B22',
})

export function ImpactoPage() {
  const [periodId, setPeriodId] = useState('total')

  const period = PERIODS.find((p) => p.id === periodId)!

  const periods = PERIODS.map((p) => ({
    label: p.label,
    pressed: periodId === p.id,
    pick: () => setPeriodId(p.id),
    style: periodButtonStyle(periodId === p.id),
  }))

  const totalEyebrow = period.eyebrow
  const totalLabel = `${period.co2.toFixed(1).replace('.', ',')} kg`
  const ordersLabel = String(period.orders)
  const kmLabel = `${period.km.toFixed(1).replace('.', ',')} km`
  const packsLabel = String(period.packs)

  const orders = ORDERS.map((o) => ({
    ...o,
    totalLabel: formatPrice(o.total),
    co2Label: `${o.co2} g`,
  }))

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
            <a href="Impacto.dc.html" aria-current="page" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', color: '#24402A', background: '#E3ECE0', padding: '10px 14px', borderRadius: '999px', minHeight: '44px', boxSizing: 'border-box' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
              Mi impacto
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '14px', textDecoration: 'none', color: '#1E2B22' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A6B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Lucía
            </a>
            <a href="Local.dc.html" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#436844', color: '#FFFFFF', textDecoration: 'none', fontWeight: '600', fontSize: '16px', padding: '12px 22px', borderRadius: '999px', minHeight: '48px', boxSizing: 'border-box' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
              Carrito · 0
            </a>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 72px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '40px', lineHeight: '1.2', letterSpacing: '-0.015em' }}>Mi impacto</h1>
            <p style={{ margin: '0', color: '#5A6B5E' }}>Lo que sumaste eligiendo EcoBite. Datos de ejemplo.</p>
          </div>
          <div role="group" aria-label="Período" style={{ display: 'flex', gap: '4px', background: '#EEF0EA', borderRadius: '999px', padding: '4px' }}>
            {periods.map((p) => (
              <button key={p.label} type="button" onClick={p.pick} aria-pressed={p.pressed} style={p.style}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Total + equivalencia */}
        <section aria-label="Total ahorrado" style={{ position: 'relative', overflow: 'hidden', background: '#436844', color: '#FFFFFF', borderRadius: '28px', padding: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px' }}>
          <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: '#BBDB9B', opacity: '0.14', top: '-160px', right: '-60px' }}></div>
          <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: '#24402A', opacity: '0.6', bottom: '-120px', left: '30%' }}></div>
          <div style={{ position: 'relative', flex: '1 1 420px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', color: '#BBDB9B' }}>{totalEyebrow}</span>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '80px', lineHeight: '1', letterSpacing: '-0.03em' }}>{totalLabel}</div>
            <p style={{ margin: '0', fontSize: '18px', maxWidth: '460px' }}>de CO₂ que no se emitieron gracias a tus pedidos en bici y con envases compostables.</p>
            <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#BBDB9B', color: '#24402A', fontWeight: '500', fontSize: '14px', padding: '8px 14px 8px 12px', borderRadius: '999px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"></path><path d="M7 16v6"></path><path d="M13 19v3"></path><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"></path></svg>
              [Equivalencia que defina Data]
            </span>
          </div>
          <div style={{ position: 'relative', flex: '0 1 auto', display: 'flex', background: '#F7F5EF', borderRadius: '999px', padding: '22px 26px' }}>
            <img src="/_blob/57ab39449d265a398f1ef065363d2d49" alt="" style={{ height: '120px', width: 'auto' }} />
          </div>
        </section>

        {/* Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: '1 1 240px', background: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 2px rgb(30 43 34 / 0.06), 0 1px 3px rgb(30 43 34 / 0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#5A6B5E' }}>Pedidos sustentables</span>
              <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EEF6E4', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg></span>
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '36px', lineHeight: '1.1' }}>{ordersLabel}</span>
          </div>
          <div style={{ flex: '1 1 240px', background: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 2px rgb(30 43 34 / 0.06), 0 1px 3px rgb(30 43 34 / 0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#5A6B5E' }}>Km entregados en bici</span>
              <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EEF6E4', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path></svg></span>
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '36px', lineHeight: '1.1' }}>{kmLabel}</span>
          </div>
          <div style={{ flex: '1 1 240px', background: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 2px rgb(30 43 34 / 0.06), 0 1px 3px rgb(30 43 34 / 0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#5A6B5E' }}>Envases compostables</span>
              <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EEF6E4', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="M3.29 7 12 12 20.71 7"></path></svg></span>
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '36px', lineHeight: '1.1' }}>{packsLabel}</span>
          </div>
        </div>

        {/* Historial + metodología */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <section aria-label="Historial de pedidos" style={{ flex: '999 1 560px', minWidth: '0', background: '#FFFFFF', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '24px' }}>Historial de pedidos</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '520px', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#5A6B5E' }}>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px 10px 0', borderBottom: '1px solid #E2E5DD' }}>Fecha</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD' }}>Local</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD' }}>Zona</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD', textAlign: 'right' }}>Total</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 0 10px 12px', borderBottom: '1px solid #E2E5DD', textAlign: 'right' }}>CO₂ ahorrado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ padding: '14px 12px 14px 0', borderBottom: '1px solid #EEF0EA', color: '#5A6B5E', whiteSpace: 'nowrap' }}>{o.date}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA', fontWeight: '500' }}>{o.local}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA', color: '#5A6B5E' }}>{o.zone}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA', textAlign: 'right', whiteSpace: 'nowrap' }}>{o.totalLabel}</td>
                      <td style={{ padding: '14px 0 14px 12px', borderBottom: '1px solid #EEF0EA', textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#BBDB9B', color: '#24402A', fontWeight: '500', fontSize: '13px', padding: '4px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{o.co2Label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cómo lo calculamos (transparencia, EB-03) */}
          <section aria-label="Cómo lo calculamos" style={{ flex: '1 1 320px', minWidth: '0', background: '#EEF6E4', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#436844" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px', color: '#24402A' }}>Cómo lo calculamos</h2>
            </div>
            <p style={{ margin: '0', fontSize: '14px', color: '#5A6B5E' }}>Es una estimación transparente, no una medición. Por cada pedido sumamos:</p>
            <ol style={{ margin: '0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li><strong style={{ fontWeight: '600' }}>Trayecto:</strong> distancia de tu zona × diferencia de emisiones entre moto ([g/km]) y bici o eléctrico ([g/km]).</li>
              <li><strong style={{ fontWeight: '600' }}>Envases:</strong> [g de CO₂] evitados por cada envase compostable frente a uno plástico.</li>
            </ol>
            <p style={{ margin: '0', fontSize: '13px', color: '#5A6B5E' }}>El valor se guarda al confirmar el pedido y no cambia después. Fuentes de los factores: [fuente].</p>
          </section>
        </div>
      </main>
    </div>
  )
}