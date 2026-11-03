import { Link } from 'react-router-dom'
import { ArrowUpRight, Leaf } from 'lucide-react'
import { useHome } from '@/features/home'
import { CatalogLayout, LoadingState } from '@/features/catalog'
import { Alert } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'

export function ImpactoPage() {
  const { data, loading, error } = useHome()
  const co2 = data?.userImpact?.co2SavedKg
  return (
    <CatalogLayout>
      <div className="page-intro">
        <span className="eyebrow">PEQUEÑAS DECISIONES, UN IMPACTO QUE SUMA</span>
        <h1>
          Tu elección deja <em>huella positiva.</em>
        </h1>
        <p>Este es el CO₂ acumulado que registran tus pedidos en Ecobite.</p>
      </div>
      {loading ? (
        <LoadingState text="Cargando tu impacto…" />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : typeof co2 === 'number' ? (
        <section className="impact-panel" aria-label="Tu impacto acumulado">
          <Leaf size={40} aria-hidden="true" />
          <span className="eyebrow">TU CO₂ AHORRADO EN TOTAL</span>
          <p className="impact-value">
            {co2.toLocaleString('es-AR')} <span>kg</span>
          </p>
          <p>
            {co2 === 0
              ? 'Cada elección es un comienzo. Tu ahorro se irá sumando con tus pedidos.'
              : 'Un ahorro que crece con cada elección consciente.'}
          </p>
        </section>
      ) : (
        <p className="empty-state">Tu impacto todavía no está disponible.</p>
      )}
      <section className="impact-explanation">
        <div>
          <span className="eyebrow">CON TRANSPARENCIA</span>
          <h2>Los números tienen una historia.</h2>
          <p>
            El ahorro es una estimación según las reglas ambientales de Ecobite. Consultá la metodología para
            conocer cómo se calcula.
          </p>
          <Link className="text-link" to={ROUTES.methodology}>
            Cómo calculamos el CO₂ <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <Link className="eco-button" to={ROUTES.restaurants}>
          Elegí tu próxima comida <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </CatalogLayout>
  )
}
