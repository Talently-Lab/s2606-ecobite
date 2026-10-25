export function ConfirmacionPedido() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F5EF', color: '#1E2B22', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '16px', lineHeight: '1.5' }}>
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E5DD' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="Main.dc.html" aria-label="EcoBite, inicio" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/_blob/57ab39449d265a398f1ef065363d2d49" alt="" style={{ height: '44px', width: 'auto' }} />
            <img src="/_blob/5ce0b397a4628dd6b5d767a01c17a9b8" alt="EcoBite" style={{ height: '30px', width: 'auto' }} />
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '880px', margin: '0 auto', padding: '56px 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>

        {/* Éxito */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
          <span style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#BBDB9B', color: '#24402A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
          </span>
          <h1 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '40px', lineHeight: '1.2', letterSpacing: '-0.015em' }}>¡Pedido confirmado!</h1>
          <p style={{ margin: '0', fontSize: '18px', color: '#5A6B5E', maxWidth: '520px' }}>Verde Bowl ya está preparando tu pedido. Llega en 25–35 min a Honduras 4800, 2° B.</p>
          <span style={{ fontSize: '14px', color: '#5A6B5E' }}>Pedido n.º [0000]</span>
        </div>

        {/* Impacto del pedido (EB-10) */}
        <section aria-label="Tu impacto con este pedido" style={{ width: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', background: '#436844', color: '#FFFFFF', borderRadius: '28px', padding: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px' }}>
          <div style={{ position: 'absolute', width: '340px', height: '340px', borderRadius: '50%', background: '#BBDB9B', opacity: '0.14', top: '-140px', right: '-80px' }}></div>
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: '#24402A', opacity: '0.6', bottom: '-110px', left: '-60px' }}></div>
          <div style={{ position: 'relative', flex: '1 1 360px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', color: '#BBDB9B' }}>TU IMPACTO CON ESTE PEDIDO</span>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '72px', lineHeight: '1', letterSpacing: '-0.03em' }}>325 g</div>
            <p style={{ margin: '0', fontSize: '18px', lineHeight: '1.5' }}>de CO₂ que no se emitieron por elegir reparto en bici y envases compostables en lugar de un delivery en moto.</p>
            <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#BBDB9B', color: '#24402A', fontWeight: '500', fontSize: '14px', padding: '8px 14px 8px 12px', borderRadius: '999px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"></path><path d="M7 16v6"></path><path d="M13 19v3"></path><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"></path></svg>
              [Equivalencia que defina Data]
            </span>
          </div>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '0', background: 'rgb(255 255 255 / 0.1)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '14px', color: '#E3ECE0' }}>Llevás ahorrado en total</span>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '36px', lineHeight: '1.1' }}>[X,X] kg</span>
            <span style={{ fontSize: '14px', color: '#E3ECE0' }}>en [N] pedidos con EcoBite</span>
            <a href="Impacto.dc.html" style={{ marginTop: '8px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontWeight: '600', fontSize: '14px', textDecoration: 'underline', textUnderlineOffset: '3px', padding: '8px 0' }}>Ver mi impacto
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
            </a>
          </div>
        </section>

        {/* Resumen */}
        <section aria-label="Detalle del pedido" style={{ width: '100%', boxSizing: 'border-box', background: '#FFFFFF', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: '0', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px' }}>Detalle del pedido</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span>1 × Bowl de quinoa y palta</span><span>$ 8.450</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span>2 × Limonada de jengibre</span><span>$ 5.800</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#5A6B5E' }}><span>Envío en bici · Palermo</span><span>$ 900</span></div>
          </div>
          <div style={{ height: '1px', background: '#E2E5DD' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '20px' }}><span>Total · Efectivo al recibir</span><span>$ 15.150</span></div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
          <a href="Main.dc.html" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#436844', color: '#FFFFFF', textDecoration: 'none', fontWeight: '600', fontSize: '16px', padding: '14px 24px', borderRadius: '999px', minHeight: '52px', boxSizing: 'border-box' }}>Seguir explorando locales</a>
          <a href="Impacto.dc.html" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FFFFFF', color: '#436844', border: '1.5px solid #436844', textDecoration: 'none', fontWeight: '600', fontSize: '16px', padding: '14px 24px', borderRadius: '999px', minHeight: '52px', boxSizing: 'border-box' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
            Ver mi impacto
          </a>
        </div>
      </main>
    </div>
  )
}