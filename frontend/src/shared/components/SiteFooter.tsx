import { Link } from 'react-router-dom'
import { ArrowUpRight, Leaf } from 'lucide-react'
import { Logo } from './Logo'
import { ROUTES } from '@/shared/config/routes'

export function SiteFooter() {
  return (
    <footer className="border-t border-bosque/10 bg-niebla">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="max-w-xs space-y-4">
            <Link to={ROUTES.home} aria-label="EcoBite, inicio" className="inline-block">
              <Logo />
            </Link>
            <p className="text-sm leading-relaxed text-musgo">
              Comer rico. Elegir mejor.
              <br />
              Pequeñas decisiones, un impacto que suma.
            </p>
          </div>
          <nav aria-label="Información de EcoBite" className="flex flex-col gap-1 text-sm font-medium">
            {[
              { to: ROUTES.methodology, label: 'Cómo calculamos el CO₂' },
              { to: ROUTES.join, label: 'Sumá tu local' },
              { to: ROUTES.contact, label: 'Contacto' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="group inline-flex min-h-11 items-center justify-between gap-8"
              >
                {label}
                <ArrowUpRight
                  className="size-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-bosque/15 pt-6 text-xs text-musgo">
          <p>© {new Date().getFullYear()} EcoBite · Proyecto Talently Lab S2606</p>
          <span className="inline-flex items-center gap-2">
            <Leaf className="size-4" aria-hidden="true" />
            Una forma más consciente de pedir.
          </span>
        </div>
      </div>
    </footer>
  )
}
