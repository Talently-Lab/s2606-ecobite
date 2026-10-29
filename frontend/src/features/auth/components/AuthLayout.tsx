import type { ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from '@/shared/components/Logo'
import { returnTo } from '../routes/returnTo'
import { ROUTES } from '@/shared/config/routes'

interface AuthLayoutProps {
  /** Texto bajo el título del panel de marca. */
  intro: string
  /** Contenido extra del panel de marca (ej. lista de beneficios). */
  extra?: ReactNode
  children: ReactNode
}

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 flex-1 items-center justify-center rounded-full text-[15px] font-semibold no-underline ${
    isActive ? 'bg-white text-noche shadow-sm' : 'text-musgo hover:text-tinta'
  }`

export function AuthLayout({ intro, extra, children }: AuthLayoutProps) {
  const from = returnTo(useLocation().state)
  return (
    <div className="flex min-h-screen flex-wrap bg-crema">
      <aside className="relative flex min-h-80 min-w-0 flex-[1_1_420px] flex-col justify-between gap-10 overflow-hidden bg-bosque p-8 text-white sm:p-12">
        <div className="pointer-events-none absolute -top-45 -right-50 size-130 rounded-full bg-brote opacity-15" />
        <div className="pointer-events-none absolute -bottom-35 -left-25 size-80 rounded-full bg-noche opacity-55" />

        <Link
          to={ROUTES.home}
          aria-label="EcoBite, inicio"
          className="relative self-start rounded-full bg-crema py-2.5 pr-5.5 pl-3.5"
        >
          <Logo />
        </Link>

        <div className="relative flex max-w-115 flex-col gap-4">
          <h2 className="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-[40px]">
            Cada pedido suma al planeta
          </h2>
          <p className="text-lg text-niebla">{intro}</p>
          {extra}
        </div>

        <span className="relative text-[13px] text-niebla">Delivery sustentable · Talently Lab S2606</span>
      </aside>

      <main className="flex min-w-0 flex-[1_1_480px] items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-110 flex-col gap-6">
          <nav aria-label="Acceso" className="flex gap-1 rounded-full bg-arena p-1">
            <NavLink state={{ from }} to={ROUTES.login} className={tabClass}>
              Ingresar
            </NavLink>
            <NavLink state={{ from }} to={ROUTES.register} className={tabClass}>
              Crear cuenta
            </NavLink>
          </nav>
          {children}
        </div>
      </main>
    </div>
  )
}
