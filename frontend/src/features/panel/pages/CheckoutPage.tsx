import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/shared/components/Logo'
import { ROUTES } from '@/shared/config/routes'

export function CheckoutPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <Link to={ROUTES.home} aria-label="EcoBite, inicio">
        <Logo />
      </Link>
      <h1 className="font-display text-3xl font-semibold">Checkout pendiente de integración</h1>
      <p>
        Aún no se pueden confirmar ni pagar pedidos. Podés explorar los restaurantes y armar tu selección
        desde su menú.
      </p>
      <Link
        to={ROUTES.restaurants}
        className="inline-flex min-h-11 items-center gap-2 font-semibold underline"
      >
        <ArrowLeft className="size-5" aria-hidden="true" /> Volver a restaurantes
      </Link>
    </main>
  )
}
