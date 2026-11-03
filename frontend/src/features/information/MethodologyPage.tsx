import { ArrowUpRight, Bike, Check, ChevronDown, Leaf, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { InformationLayout } from './InformationLayout'

export function MethodologyPage() {
  return (
    <InformationLayout title="Cómo calculamos el CO₂">
      <div className="methodology-container">
        <section className="methodology-intro" aria-labelledby="methodology-title">
          <div data-reveal className="methodology-heading">
            <span className="methodology-icon" aria-hidden="true">
              <Bike size={28} strokeWidth={1.6} />
            </span>
            <h1 id="methodology-title">Cómo calculamos el CO₂</h1>
            <p>
              Conocé qué hay detrás del impacto de tu pedido. Estimamos las emisiones que se evitan al
              entregar en bici en lugar de usar un auto a nafta.
            </p>
          </div>
          <aside data-reveal className="methodology-formula" aria-labelledby="formula-title">
            <div className="methodology-formula-heading">
              <Leaf size={20} aria-hidden="true" />
              <h2 id="formula-title">La idea detrás del ahorro</h2>
            </div>
            <ol aria-label="Fórmula de referencia del ahorro de CO₂">
              <li>
                <span aria-hidden="true">
                  <MapPin size={18} />
                </span>
                Distancia del recorrido
              </li>
              <li>
                <span>×</span>Diferencia de emisiones entre auto y bici
              </li>
              <li className="methodology-formula-result">
                <span>=</span>CO₂ evitado estimado
              </li>
            </ol>
            <p>La cifra corresponde al traslado del pedido.</p>
          </aside>
        </section>

        <section className="methodology-explanation" aria-labelledby="methodology-details-title">
          <h2 id="methodology-details-title">Cómo se construye la estimación</h2>
          <div className="methodology-steps">
            <article data-reveal className="methodology-step">
              <span className="methodology-step-icon">
                <MapPin size={23} aria-hidden="true" />
              </span>
              <h3>Según la distancia</h3>
              <p>Usamos el recorrido promedio de la zona para comparar ambos transportes.</p>
            </article>
            <article data-reveal className="methodology-step">
              <span className="methodology-step-icon">
                <Bike size={23} aria-hidden="true" />
              </span>
              <h3>Una referencia para tu entrega</h3>
              <p>
                Comparamos las emisiones del reparto en bici con las de un auto a nafta. El valor del carrito
                es una estimación.
              </p>
            </article>
            <article data-reveal className="methodology-step">
              <span className="methodology-step-icon">
                <Check size={23} aria-hidden="true" />
              </span>
              <h3>Se suma al completar el pedido</h3>
              <p>Los pedidos pendientes o cancelados no suman a tu impacto.</p>
            </article>
          </div>
        </section>

        <section data-reveal className="methodology-note" aria-labelledby="methodology-note-title">
          <Leaf size={23} aria-hidden="true" />
          <div>
            <h2 id="methodology-note-title">El alcance de esta cifra</h2>
            <p>
              Estimamos las emisiones del traslado, no la huella total de la comida. Los factores de emisión
              del proyecto son provisionales.
            </p>
          </div>
        </section>

        <details className="methodology-details">
          <summary>
            Ver el detalle del cálculo
            <ChevronDown size={21} aria-hidden="true" />
          </summary>
          <div>
            <p>Distancia × diferencia de emisiones entre el auto y la bici = CO₂ evitado estimado.</p>
            <p>
              En el carrito, la estimación se calcula con el CO₂ por unidad de cada plato. Los factores de
              emisión del proyecto son provisionales.
            </p>
          </div>
        </details>
        <div className="methodology-actions">
          <Link to={ROUTES.restaurants} className="eco-button">
            Volver a restaurantes
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </InformationLayout>
  )
}
