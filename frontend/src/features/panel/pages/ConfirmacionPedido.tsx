import { CatalogLayout } from '@/features/catalog'
import { ArrowRight, Check, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'
import { formatPrice } from '@/features/catalog'
import { panelService } from '../panelService'
import type { ConfirmationData } from '../types'

export function ConfirmacionPedido() {
  const { id } = useParams()
  const orderId = Number(id)
  const [data, setData] = useState<ConfirmationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isSafeInteger(orderId) || orderId <= 0) return
    panelService
      .confirmation(orderId)
      .then(({ data }) => setData(data))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No pudimos cargar la confirmación.')
      })
  }, [orderId])

  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return (
      <CatalogLayout>
        <div className="checkout-shell mx-auto w-full max-w-2xl px-6 py-10">
          <Alert>El identificador del pedido no es válido.</Alert>
        </div>
      </CatalogLayout>
    )
  }
  if (error) {
    return (
      <CatalogLayout>
        <div className="checkout-shell mx-auto w-full max-w-2xl space-y-5 px-6 py-10">
          <Alert>{error}</Alert>
          <Link to={ROUTES.restaurants}>Volver a restaurantes</Link>
        </div>
      </CatalogLayout>
    )
  }
  if (!data) {
    return (
      <CatalogLayout>
        <div className="flex min-h-screen items-center justify-center gap-2 text-musgo">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Cargando confirmación…
        </div>
      </CatalogLayout>
    )
  }

  const { order, myImpact } = data
  const saved = order.environmentalImpact?.co2SavedKg ?? 0

  return (
    <CatalogLayout>
      <div className="checkout-shell mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-12">
        <header className="space-y-3 text-center">
          <span className="confirmation-check mx-auto flex size-16 items-center justify-center rounded-full bg-brote text-noche">
            <Check className="size-9" aria-hidden="true" />
          </span>
          <h1 className="font-display text-4xl font-semibold">¡Pedido confirmado!</h1>
          <p className="text-lg text-musgo">{order.restaurant.name} ya está preparando tu pedido.</p>
          <p className="text-sm text-musgo">Pedido n.º {order.id}</p>
        </header>

        <section className="grid w-full gap-6 rounded-3xl bg-bosque p-8 text-white md:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-widest text-brote">TU IMPACTO CON ESTE PEDIDO</p>
            <p className="font-display text-6xl font-bold">{saved.toLocaleString('es-AR')} kg</p>
            <p className="text-lg">de CO₂ que no se emitieron gracias a esta elección.</p>
          </div>
          <div className="space-y-2 rounded-2xl bg-white/10 p-5">
            <p className="text-sm text-niebla">Llevás ahorrado en total</p>
            <p className="font-display text-3xl font-bold">
              {myImpact.co2SavedKg.toLocaleString('es-AR')} kg
            </p>
            <p className="text-sm text-niebla">en {myImpact.ordersCount} pedidos con EcoBite</p>
            <Link
              to={ROUTES.impact}
              className="inline-flex items-center gap-1 pt-3 font-semibold text-white underline"
            >
              Ver mi impacto <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="w-full space-y-4 rounded-3xl bg-white p-7">
          <h2 className="font-display text-xl font-semibold">Detalle del pedido</h2>
          {order.items.map((item) => (
            <div key={item.dishId} className="flex justify-between gap-4">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-borde pt-4 font-display text-xl font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </section>
        <Link to={ROUTES.restaurants} className="rounded-full bg-bosque px-6 py-3 font-semibold text-white">
          Seguir explorando locales
        </Link>
      </div>
    </CatalogLayout>
  )
}
