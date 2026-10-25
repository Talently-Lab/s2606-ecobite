// Datos de ejemplo: reemplazar por los reales
const ORDERS = [
  { id: '#1048', date: '20 oct 2026', client: 'Lucía Pérez', local: 'Verde Bowl', zone: 'Palermo', total: 15150, co2: 325, status: 'Entregado' },
  { id: '#1047', date: '20 oct 2026', client: 'Martín Gómez', local: 'Raíz Cocina', zone: 'Recoleta', total: 18400, co2: 420, status: 'En camino' },
  { id: '#1046', date: '19 oct 2026', client: 'Sofía Ruiz', local: 'Verde Bowl', zone: 'Palermo', total: 9800, co2: 290, status: 'Entregado' },
  { id: '#1045', date: '19 oct 2026', client: 'Diego Torres', local: 'Raíz Cocina', zone: 'Belgrano', total: 16200, co2: 405, status: 'Preparando' },
  { id: '#1044', date: '18 oct 2026', client: 'Ana Silva', local: 'Verde Bowl', zone: 'Caballito', total: 11300, co2: 300, status: 'Entregado' },
  { id: '#1043', date: '18 oct 2026', client: 'Julián Díaz', local: 'Raíz Cocina', zone: 'Palermo', total: 13700, co2: 350, status: 'Cancelado' },
]

const STATUS_COLORS = {
  Entregado: { background: '#E3ECE0', color: '#24402A' },
  'En camino': { background: '#F6E8DE', color: '#9E5A30' },
  Preparando: { background: '#EEF6E4', color: '#436844' },
  Cancelado: { background: '#F9E9E6', color: '#B3412E' },
}

const statusStyle = (status) => ({
  display: 'inline-flex',
  alignItems: 'center',
  fontWeight: '500',
  fontSize: '13px',
  padding: '4px 10px',
  borderRadius: '999px',
  whiteSpace: 'nowrap',
  ...STATUS_COLORS[status],
})

const formatPrice = (n) => `$ ${n.toLocaleString('es-AR')}`

export function PanelAdmin() {
  const userName = 'Admin EcoBite'
  const isAdmin = true // conectar con useAuth() / roles
  const denied = !isAdmin
  const allowed = isAdmin

  const orders = ORDERS.map((o) => ({
    ...o,
    totalLabel: formatPrice(o.total),
    co2Label: `${o.co2} g`,
    statusStyle: statusStyle(o.status),
  }))

  const co2Total = `${(ORDERS.reduce((s, o) => s + o.co2, 0) / 1000).toFixed(1).replace('.', ',')} kg`
  const ordersTotal = String(ORDERS.length)
  const avgTicket = formatPrice(Math.round(ORDERS.reduce((s, o) => s + o.total, 0) / ORDERS.length))
  const activeLocals = String(new Set(ORDERS.map((o) => o.local)).size)

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5EF', color: '#1E2B22', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '16px', lineHeight: '1.5' }}>

      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E5DD' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
          <a href="Main.dc.html" aria-label="EcoBite, inicio" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/_blob/57ab39449d265a398f1ef065363d2d49" alt="" style={{ height: '44px', width: 'auto' }} />
            <img src="/_blob/5ce0b397a4628dd6b5d767a01c17a9b8" alt="EcoBite" style={{ height: '30px', width: 'auto' }} />
          </a>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#24402A', color: '#FFFFFF', fontSize: '12px', fontWeight: '600', letterSpacing: '0.06em', padding: '6px 12px', borderRadius: '999px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            ADMIN
          </span>
          <span style={{ flex: '1' }}></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
            <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E3ECE0', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
            {userName}
          </span>
          <a href="Main.dc.html" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', padding: '12px 4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path></svg>
            Salir
          </a>
        </div>
      </header>

      {/* Sin acceso (usuario común) */}
      {denied && (
        <main style={{ maxWidth: '560px', margin: '0 auto', padding: '96px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <span style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F9E9E6', color: '#B3412E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <h1 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '32px', lineHeight: '1.25' }}>No tenés acceso a esta sección</h1>
          <p style={{ margin: '0', color: '#5A6B5E' }}>El panel de métricas es solo para el equipo de EcoBite. Si creés que es un error, escribinos.</p>
          <a href="Main.dc.html" style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#436844', color: '#FFFFFF', textDecoration: 'none', fontWeight: '600', padding: '14px 24px', borderRadius: '999px', minHeight: '52px', boxSizing: 'border-box' }}>Volver al inicio</a>
        </main>
      )}

      {/* Panel (admin) */}
      {allowed && (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 72px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h1 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '40px', lineHeight: '1.2', letterSpacing: '-0.015em' }}>Resumen del negocio</h1>
              <p style={{ margin: '0', color: '#5A6B5E' }}>Octubre 2026 · Datos de ejemplo</p>
            </div>
            <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Actualizado al confirmar cada pedido</span>
          </div>

          {/* 3 KPI */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1 1 300px', position: 'relative', overflow: 'hidden', background: '#436844', color: '#FFFFFF', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: '#BBDB9B', opacity: '0.16', top: '-80px', right: '-60px' }}></div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#E3ECE0' }}>CO₂ ahorrado total</span>
                <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#BBDB9B', color: '#24402A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg></span>
              </div>
              <span style={{ position: 'relative', fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '48px', lineHeight: '1.05', letterSpacing: '-0.02em' }}>{co2Total}</span>
              <span style={{ position: 'relative', fontSize: '14px', color: '#E3ECE0' }}>vs. los mismos pedidos en moto</span>
            </div>
            <div style={{ flex: '1 1 300px', background: '#FFFFFF', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 2px rgb(30 43 34 / 0.06), 0 1px 3px rgb(30 43 34 / 0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#5A6B5E' }}>Pedidos</span>
                <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEF6E4', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg></span>
              </div>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '48px', lineHeight: '1.05', letterSpacing: '-0.02em' }}>{ordersTotal}</span>
              <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Ticket promedio {avgTicket}</span>
            </div>
            <div style={{ flex: '1 1 300px', background: '#FFFFFF', borderRadius: '20px', padding: '28px', boxShadow: '0 1px 2px rgb(30 43 34 / 0.06), 0 1px 3px rgb(30 43 34 / 0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#5A6B5E' }}>Locales activos</span>
                <span style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEF6E4', color: '#436844', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path></svg></span>
              </div>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '48px', lineHeight: '1.05', letterSpacing: '-0.02em' }}>{activeLocals}</span>
              <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Con al menos un pedido en el mes</span>
            </div>
          </div>

          {/* Últimos pedidos */}
          <section aria-label="Últimos pedidos" style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '24px' }}>Últimos pedidos</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#5A6B5E' }}>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px 10px 0', borderBottom: '1px solid #E2E5DD' }}>Pedido</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD' }}>Fecha</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD' }}>Cliente</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD' }}>Local</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD' }}>Zona</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD', textAlign: 'right' }}>Total</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 12px', borderBottom: '1px solid #E2E5DD', textAlign: 'right' }}>CO₂</th>
                    <th scope="col" style={{ fontWeight: '500', padding: '10px 0 10px 12px', borderBottom: '1px solid #E2E5DD' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ padding: '14px 12px 14px 0', borderBottom: '1px solid #EEF0EA', fontWeight: '500', whiteSpace: 'nowrap' }}>{o.id}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA', color: '#5A6B5E', whiteSpace: 'nowrap' }}>{o.date}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA' }}>{o.client}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA' }}>{o.local}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA', color: '#5A6B5E' }}>{o.zone}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA', textAlign: 'right', whiteSpace: 'nowrap' }}>{o.totalLabel}</td>
                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #EEF0EA', textAlign: 'right', whiteSpace: 'nowrap', color: '#436844', fontWeight: '600' }}>{o.co2Label}</td>
                      <td style={{ padding: '14px 0 14px 12px', borderBottom: '1px solid #EEF0EA' }}>
                        <span style={o.statusStyle}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}