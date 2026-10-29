import { ArrowRight, Check, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { InformationLayout, PageHeading } from './InformationLayout'

export function JoinPage() {
  return (
    <InformationLayout title="Sumá tu local">
      <section className="info-container max-w-3xl! py-12 sm:py-16">
        <PageHeading
          icon={Store}
          title="Sumá tu local"
          description="Mostrá tu restaurante y su menú en EcoBite. La incorporación se coordina con nuestro equipo."
        />
        <div data-reveal className="info-card mt-8">
          <h2 className="font-display text-xl font-semibold">¿Qué necesitás preparar?</h2>
          <ul className="mt-6 space-y-4 text-sm">
            {[
              'Nombre y dirección del local.',
              'Menú con precios y disponibilidad.',
              'Información sobre envases y modalidad de entrega.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="size-5 shrink-0 text-bosque" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="mt-8">
          <Link
            to={`${ROUTES.contact}#restaurantes`}
            className="info-button bg-bosque text-white! hover:bg-noche"
          >
            Contactar al equipo
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </InformationLayout>
  )
}
