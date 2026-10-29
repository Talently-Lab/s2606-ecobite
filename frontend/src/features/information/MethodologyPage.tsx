import { Bike, Check, MapPin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { InformationLayout, PageHeading } from './InformationLayout'

export function MethodologyPage() {
  return (
    <InformationLayout title="Cómo calculamos el CO₂">
      <section className="info-container max-w-3xl! py-12 sm:py-16">
        <PageHeading
          icon={Bike}
          title="Cómo calculamos el CO₂"
          description="Estimamos las emisiones que se evitan al entregar en bici en lugar de usar un auto a nafta."
        />
        <div data-reveal className="info-card mt-8 space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 shrink-0 text-bosque" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Según la distancia</h2>
              <p className="mt-1 text-sm leading-relaxed text-musgo">
                Usamos el recorrido promedio de la zona para comparar ambos transportes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="mt-1 size-5 shrink-0 text-bosque" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Se suma al completar el pedido</h2>
              <p className="mt-1 text-sm leading-relaxed text-musgo">
                El valor del carrito es una estimación. Los pedidos pendientes o cancelados no suman a tu
                impacto.
              </p>
            </div>
          </div>
          <p className="border-t border-borde pt-5 text-sm leading-relaxed text-musgo">
            La cifra estima las emisiones del traslado, no la huella total de la comida.
          </p>
        </div>
        <details data-reveal className="info-faq mt-3">
          <summary>
            Ver el detalle del cálculo
            <Plus className="size-5 shrink-0 text-bosque" aria-hidden="true" />
          </summary>
          <p>Distancia × diferencia de emisiones entre el auto y la bici = CO₂ evitado estimado.</p>
          <p>
            Los factores de emisión del proyecto son provisionales. En el carrito, la estimación se calcula
            con el CO₂ por unidad de cada plato.
          </p>
        </details>
        <Link to={ROUTES.restaurants} className="info-text-link mt-6">
          Volver a restaurantes
        </Link>
      </section>
    </InformationLayout>
  )
}
