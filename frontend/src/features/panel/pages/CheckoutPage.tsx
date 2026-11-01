import { ArrowLeft, Leaf, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'
import { formatPrice } from '@/features/catalog'
import { panelService } from '../panelService'
import type { CheckoutQuote, CheckoutRequest } from '../types'

export function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const payload = location.state as CheckoutRequest | null
  const [quote, setQuote] = useState<CheckoutQuote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!payload?.restaurantId || !payload.items?.length) return
    panelService
      .quote(payload)
      .then(({ data }) => setQuote(data))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No pudimos calcular la cotización.')
      })
  }, [payload])

  if (!payload?.restaurantId || !payload.items?.length) {
    return (
      <main className="mx-auto max-w-2xl space-y-5 px-6 py-10">
        <h1 className="font-display text-3xl font-semibold">Checkout pendiente de integración</h1>
        <Alert>Tu carrito está vacío. Elegí platos antes de continuar.</Alert>
        <Link to={ROUTES.restaurants} className="inline-flex min-h-11 items-center gap-2 font-semibold">
          <ArrowLeft className="size-5" aria-hidden="true" /> Volver a restaurantes
        </Link>
      </main>
    )
  }

  const confirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await panelService.createOrder(payload)
      navigate(`/pedidos/${data.order.id}/confirmacion`, { replace: true })
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'No pudimos confirmar el pedido.')
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <Link to={ROUTES.restaurants} className="inline-flex min-h-11 items-center gap-2">
        <ArrowLeft className="size-5" aria-hidden="true" /> Volver a restaurantes
      </Link>
      <div>
        <p className="text-sm text-musgo">Último paso</p>
        <h1 className="font-display text-3xl font-semibold">Confirmá tu pedido</h1>
      </div>
      {error && <Alert>{error}</Alert>}
      {!quote ? (
        <p role="status" className="flex items-center gap-2 text-musgo">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Calculando cotización…
        </p>
      ) : (
        <section className="space-y-5 rounded-2xl bg-white p-6">
          <h2 className="font-display text-xl font-semibold">{quote.restaurantName}</h2>
          {quote.items.map((item) => (
            <div key={item.dishId} className="flex justify-between gap-4">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          <div className="border-t border-borde pt-4">
            <p className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(quote.subtotal)}</span>
            </p>
            {quote.environmentalImpact && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-niebla p-3 text-sm">
                <Leaf className="size-5 text-bosque" aria-hidden="true" />
                Impacto estimado: {quote.environmentalImpact.co2SavedKg.toLocaleString('es-AR')} kg de CO₂
              </p>
            )}
          </div>
          <Button type="button" className="w-full" disabled={submitting} onClick={confirm}>
            {submitting ? 'Confirmando…' : 'Confirmar pedido'}
          </Button>
        </section>
      )}
    </main>
  )
}
