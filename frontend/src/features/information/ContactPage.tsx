import { ArrowUpRight, Mail } from 'lucide-react'
import { InformationLayout, PageHeading } from './InformationLayout'

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim()

export function ContactPage() {
  return (
    <InformationLayout title="Contacto">
      <section className="info-container max-w-3xl! py-12 sm:py-16">
        <PageHeading
          icon={Mail}
          title="Contacto"
          description="Consultas, problemas con la app o incorporación de restaurantes."
        />
        <div id="restaurantes" data-reveal className="info-card mt-8 scroll-mt-8">
          {contactEmail ? (
            <>
              <h2 className="font-display text-xl font-semibold">Escribinos</h2>
              <a href={`mailto:${contactEmail}`} className="info-text-link mt-4 max-w-full break-all">
                {contactEmail}
                <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
              </a>
              <p className="mt-5 text-sm leading-relaxed text-musgo">
                Para sumar un local, incluí su nombre y dirección. Si tenés un problema con la app, indicá en
                qué pantalla ocurrió.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold">Canal de contacto aún no disponible</h2>
              <p className="mt-3 text-sm leading-relaxed text-musgo">
                Publicaremos el correo oficial en esta página cuando esté habilitado.
              </p>
            </>
          )}
        </div>
      </section>
    </InformationLayout>
  )
}
