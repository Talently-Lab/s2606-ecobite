import { useState } from 'react'

// Datos de ejemplo: reemplazar por los reales
const ZONES = [
  { id: 'palermo', label: 'Palermo', short: 'Palermo', shipping: 1500, km: 2.1 },
  { id: 'recoleta', label: 'Recoleta', short: 'Recoleta', shipping: 1800, km: 3.4 },
  { id: 'belgrano', label: 'Belgrano', short: 'Belgrano', shipping: 2000, km: 4.2 },
  { id: 'caballito', label: 'Caballito', short: 'Caballito', shipping: 2200, km: 5.0 },
]

const SUBTOTAL = 14250
const CO2_PER_KM_KG = 0.12 // valor de ejemplo hasta que Data defina la fórmula

const formatPrice = (n) => `$ ${n.toLocaleString('es-AR')}`

const inputBase = {
  minHeight: '48px',
  boxSizing: 'border-box',
  padding: '12px 16px',
  border: '1px solid #E2E5DD',
  borderRadius: '12px',
  font: 'inherit',
  color: '#1E2B22',
  background: '#FFFFFF',
}

const inputError = { ...inputBase, border: '1px solid #B3412E', background: '#FDF5F3' }

export function CheckoutPage() {
  const [showErrors] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('11 5555-0000')
  const [address, setAddress] = useState('')
  const [zoneId, setZoneId] = useState(ZONES[0].id)
  const [notes, setNotes] = useState('')

  const zone = ZONES.find((z) => z.id === zoneId)
  const nameStyle = showErrors && !name ? inputError : inputBase
  const addressStyle = showErrors && !address ? inputError : inputBase

  const zoneShort = zone.short
  const shippingLabel = formatPrice(zone.shipping)
  const totalLabel = formatPrice(SUBTOTAL + zone.shipping)
  const co2Label = `${(zone.km * CO2_PER_KM_KG * 3).toFixed(1).replace('.', ',')} kg`
  const co2Detail = `vs. el mismo pedido entregado en moto a ${zone.km.toString().replace('.', ',')} km. Valor de ejemplo hasta que Data defina la fórmula.`

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5EF', color: '#1E2B22', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '16px', lineHeight: '1.5' }}>
      {/* Header reducido: en checkout se quitan distracciones */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E5DD' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <a href="Main.dc.html" aria-label="EcoBite, inicio" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/_blob/57ab39449d265a398f1ef065363d2d49" alt="" style={{ height: '44px', width: 'auto' }} />
            <img src="/_blob/5ce0b397a4628dd6b5d767a01c17a9b8" alt="EcoBite" style={{ height: '30px', width: 'auto' }} />
          </a>
          <a href="Local.dc.html" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', padding: '12px 4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
            Volver a Verde Bowl
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 72px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h1 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '40px', lineHeight: '1.2', letterSpacing: '-0.015em' }}>Confirmá tu pedido</h1>
          <p style={{ margin: '0', color: '#5A6B5E' }}>Revisá tus datos. Te llega en 25–35 min, en bici.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
          {/* Formulario */}
          <form style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {showErrors && (
              <div role="alert" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#F9E9E6', color: '#B3412E', borderRadius: '12px', padding: '14px 16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Faltan 2 datos para confirmar el pedido. Revisá los campos marcados.</span>
              </div>
            )}

            {/* Datos de contacto */}
            <fieldset style={{ margin: '0', border: '0', padding: '24px', background: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <legend style={{ float: 'left', width: '100%', padding: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px', marginBottom: '2px' }}>1. Tus datos</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="nombre" style={{ fontWeight: '500', fontSize: '14px' }}>Nombre y apellido</label>
                  <input id="nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Lucía Pérez" style={nameStyle} />
                  {showErrors && (
                    <span style={{ fontSize: '14px', color: '#B3412E' }}>Ingresá tu nombre para que el repartidor te encuentre.</span>
                  )}
                </div>
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="telefono" style={{ fontWeight: '500', fontSize: '14px' }}>Teléfono</label>
                  <input id="telefono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 11 5555-0000" style={inputBase} />
                  <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Solo para avisarte cuando llega.</span>
                </div>
              </div>
            </fieldset>

            {/* Entrega */}
            <fieldset style={{ margin: '0', border: '0', padding: '24px', background: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <legend style={{ float: 'left', width: '100%', padding: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px', marginBottom: '2px' }}>2. Entrega</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="direccion" style={{ fontWeight: '500', fontSize: '14px' }}>Dirección</label>
                <input id="direccion" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, piso y depto" style={addressStyle} />
                {showErrors && (
                  <span style={{ fontSize: '14px', color: '#B3412E' }}>Ingresá calle y número (ej: Honduras 4800, 2° B).</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="zona" style={{ fontWeight: '500', fontSize: '14px' }}>Zona de entrega</label>
                  <select id="zona" value={zoneId} onChange={(e) => setZoneId(e.target.value)} style={inputBase}>
                    {ZONES.map((z) => (
                      <option key={z.id} value={z.id}>{z.label}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Usamos la distancia de tu zona para estimar el CO₂ ahorrado.</span>
                </div>
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="notas" style={{ fontWeight: '500', fontSize: '14px' }}>Indicaciones (opcional)</label>
                  <input id="notas" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: timbre roto, llamar al llegar" style={inputBase} />
                </div>
              </div>
            </fieldset>

            {/* Pago simulado */}
            <fieldset style={{ margin: '0', border: '0', padding: '24px', background: '#FFFFFF', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <legend style={{ float: 'left', width: '100%', padding: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px', marginBottom: '2px' }}>3. Pago</legend>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: '2px solid #436844', borderRadius: '12px', background: '#E3ECE0', cursor: 'pointer' }}>
                <input type="radio" name="pago" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#436844', margin: '0' }} />
                <span style={{ flex: '1', fontWeight: '500' }}>Efectivo al recibir</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: '1px solid #E2E5DD', borderRadius: '12px', cursor: 'pointer' }}>
                <input type="radio" name="pago" style={{ width: '20px', height: '20px', accentColor: '#436844', margin: '0' }} />
                <span style={{ flex: '1', fontWeight: '500' }}>Tarjeta al recibir</span>
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: '#5A6B5E' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                <span>Checkout simulado del MVP: no se procesa ningún pago online.</span>
              </div>
            </fieldset>
          </form>

          {/* Resumen */}
          <aside aria-label="Resumen del pedido" style={{ flex: '1 1 340px', minWidth: '0', maxWidth: '100%', background: '#FFFFFF', borderRadius: '24px', padding: '24px', boxSizing: 'border-box', boxShadow: '0 8px 24px rgb(30 43 34 / 0.10)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '24px', lineHeight: '1.3' }}>Resumen</h2>
              <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Verde Bowl · 3 productos</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span>1 × Bowl de quinoa y palta</span><span>$ 8.450</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span>2 × Limonada de jengibre</span><span>$ 5.800</span></div>
            </div>
            <div style={{ height: '1px', background: '#E2E5DD' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5A6B5E' }}><span>Subtotal</span><span style={{ color: '#1E2B22' }}>$ 14.250</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5A6B5E' }}><span>Envío en bici · {zoneShort}</span><span style={{ color: '#1E2B22' }}>{shippingLabel}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px', paddingTop: '4px' }}><span>Total</span><span>{totalLabel}</span></div>
            </div>
            <div style={{ background: '#EEF6E4', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ flex: 'none', color: '#436844', paddingTop: '2px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg></span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: '600', fontSize: '15px', color: '#24402A' }}>Vas a ahorrar {co2Label} de CO₂</span>
                <span style={{ fontSize: '13px', color: '#5A6B5E' }}>{co2Detail}</span>
              </div>
            </div>
            <a href="Confirmacion.dc.html" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#436844', color: '#FFFFFF', textDecoration: 'none', fontWeight: '600', fontSize: '16px', padding: '14px 22px', borderRadius: '999px', minHeight: '52px', boxSizing: 'border-box' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
              Confirmar pedido · {totalLabel}
            </a>
            <span style={{ fontSize: '12px', color: '#5A6B5E', textAlign: 'center' }}>Al confirmar, guardamos tu pedido y te avisamos cuando sale.</span>
          </aside>
        </div>
      </main>
    </div>
  )
}