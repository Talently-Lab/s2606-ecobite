import { DeliveryDestinationField } from '@/shared/components/DeliveryDestinationField'
import { CatalogLayout, formatPrice, refreshCartMenus } from '@/features/catalog'
import { useAuth } from '@/features/auth'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button } from '@/shared/components/ui'
import {
  beginConfirmation,
  cartInputs,
  finishConfirmation,
  getOrders,
  releaseConfirmation,
  useOrders,
} from '@/shared/lib/orderDraft'
import { ApiError } from '@/shared/lib/http'
import { checkoutUrl, ROUTES, restaurantMenuUrl } from '@/shared/config/routes'
import { panelService } from '../panelService'
import { PaymentForm, type PaymentMethod } from '../PaymentForm'
import type { CheckoutQuote } from '../types'
import '../checkout.css'

export function CheckoutPage() {
  const navigate = useNavigate()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
  const { logout } = useAuth()
  const state = useOrders()
  const [params] = useSearchParams()
  const selected = params.get('restaurante')
  const restaurantId =
    selected !== null && /^[1-9]\d*$/.test(selected) && Number.isSafeInteger(Number(selected))
      ? Number(selected)
      : null
  const input = useMemo(() => {
    const available = cartInputs(state)
    if (selected === null && available.length === 1) return available[0]
    return available.find((order) => order.restaurantId === restaurantId)
  }, [state, restaurantId, selected])
  const key = JSON.stringify(input)
  const [result, setResult] = useState<{
    key: string | undefined
    quote?: CheckoutQuote
    error?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [verified, setVerified] = useState(false)
  const busy = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const [attempt, setAttempt] = useState(0)
  const current = result?.key === key ? result : null
  const quote = current?.quote
  const returnTo = input ? checkoutUrl(input.restaurantId) : ROUTES.checkout

  useEffect(() => {
    if (!input?.destination || state.pending) return
    let active = true
    void panelService.quote(input).then(
      ({ data }) => {
        if (active) setResult({ key, quote: data })
      },
      (reason: unknown) => {
        if (!active) return
        if (reason instanceof ApiError && reason.status === 401) {
          logout({ preserveCart: true })
          navigate(ROUTES.login, { state: { from: returnTo }, replace: true })
          return
        }
        if (reason instanceof ApiError && [400, 404].includes(reason.status))
          void refreshCartMenus([input.restaurantId])
        setResult({
          key,
          error: reason instanceof Error ? reason.message : 'No pudimos actualizar el carrito.',
        })
      },
    )
    return () => {
      active = false
    }
  }, [input, key, attempt, state.pending, logout, navigate, returnTo])

  async function confirm(paymentMethod: PaymentMethod) {
    if (busy.current || !quote || !input?.destination || state.pending) return
    busy.current = true
    setSubmitting(true)
    setError(null)
    let pendingKey: string | undefined
    try {
      if (!mounted.current || getOrders().ownerId !== state.ownerId) return
      if (
        JSON.stringify(cartInputs(getOrders()).find((order) => order.restaurantId === input.restaurantId)) !==
        JSON.stringify(input)
      ) {
        setError('El carrito cambió. Revisá los productos antes de confirmar.')
        return
      }
      const pending = beginConfirmation(input.restaurantId, Math.round(quote.subtotal * 100))
      pendingKey = pending.key
      const { data } = await panelService.createOrder(input, quote)
      if (getOrders().pending?.key !== pending.key) return
      finishConfirmation()
      navigate(`/pedidos/${data.order.id}/confirmacion`, { replace: true, state: { paymentMethod } })
    } catch (reason) {
      if (pendingKey && getOrders().pending?.key !== pendingKey) return
      if (
        reason instanceof ApiError &&
        ((reason.status >= 400 && reason.status < 500) || reason.safeToRetry)
      ) {
        if (pendingKey) releaseConfirmation()
        if (reason.status === 401) {
          logout({ preserveCart: true })
          navigate(ROUTES.login, { state: { from: returnTo }, replace: true })
          return
        }
        if (reason.status === 409 && reason.quote) setResult({ key, quote: reason.quote as CheckoutQuote })
        else {
          setResult(null)
          setAttempt((value) => value + 1)
        }
      }
      setError(reason instanceof Error ? reason.message : 'No recibimos la confirmación del pedido.')
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  return (
    <CatalogLayout>
      <div className="checkout-page">
        <header className="checkout-header">
          <Link
            state={input ? { restoreMenuScroll: true } : undefined}
            to={input ? restaurantMenuUrl(input.restaurantId) : `${ROUTES.restaurants}?carrito=1`}
            className="inline-flex min-h-11 items-center underline"
          >
            {input ? 'Volver al menú' : 'Volver a los carritos'}
          </Link>
          <h1 className="font-display font-semibold">
            {input ? 'Revisá y pagá tu pedido' : 'Elegí un carrito'}
          </h1>
        </header>
        {!input ? (
          <Alert>
            {cartInputs(state).length
              ? 'Elegí un restaurante desde el carrito para confirmar su pedido por separado.'
              : 'Tu carrito está vacío. Elegí platos antes de continuar.'}
          </Alert>
        ) : (
          <>
            {!input.destination && (
              <div role="status" className="mb-6 rounded-xl border border-borde bg-niebla p-4">
                <p className="font-semibold">Primero, indicá dónde querés recibir tu pedido</p>
                <p>
                  Usá tu ubicación o buscá y seleccioná una dirección para calcular la entrega y habilitar el
                  pago.
                </p>
                <a href="#checkout-destination" className="inline-flex min-h-11 items-center underline">
                  Indicar destino de entrega
                </a>
              </div>
            )}
            <div className="checkout-columns">
              <aside className="checkout-summary" aria-labelledby="order-summary-title">
                <h2 id="order-summary-title" className="font-display text-xl font-semibold">
                  Tu pedido de {quote?.restaurantName ?? state.drafts[input.restaurantId]?.name}
                </h2>
                <div id="checkout-destination" className="scroll-mt-6">
                  <DeliveryDestinationField disabled={submitting || !!state.pending} />
                </div>
                <div className="checkout-delivery-impact" aria-live="polite">
                  <p>
                    Distancia por calles: {quote ? `${quote.distanceKm.toLocaleString('es-AR')} km` : '—'}
                  </p>
                  <p>
                    CO₂ evitado estimado:{' '}
                    {quote ? `${quote.environmentalImpact?.co2SavedKg.toLocaleString('es-AR')} kg` : '—'}
                  </p>
                  <small>
                    Una entrega · Auto 0,17 kg/km frente a bici sin emisiones directas. Recorrido de
                    referencia, sin tiempo de entrega.
                  </small>
                </div>
                <div className="checkout-items">
                  {quote
                    ? quote.items.map((item) => (
                        <p key={item.dishId} className="flex justify-between gap-4">
                          <span>
                            {item.quantity} × {item.name}
                          </span>
                          <span className="whitespace-nowrap">{formatPrice(item.subtotal)}</span>
                        </p>
                      ))
                    : input.items.map((item) => (
                        <div key={item.dishId} className="checkout-item-placeholder" aria-hidden="true">
                          <span />
                          <span />
                        </div>
                      ))}
                </div>
                <div className="checkout-totals">
                  <p>
                    <span>Subtotal de productos</span>
                    <strong>{quote ? formatPrice(quote.subtotal) : '—'}</strong>
                  </p>
                  <p>
                    <span>Envío</span>
                    <span>Sin cargo en esta demo</span>
                  </p>
                  <p className="font-semibold">
                    <span>Total (ARS)</span>
                    <span>{quote ? formatPrice(quote.subtotal) : '—'}</span>
                  </p>
                </div>
                <p className="text-sm text-musgo">
                  Solo se confirma este restaurante. Los demás carritos se conservan.
                </p>
              </aside>
              <div className="checkout-payment">
                {!state.storageAvailable && (
                  <Alert>
                    El carrito no podrá recuperarse al recargar esta pestaña. Conservá esta página hasta
                    recibir la confirmación.
                  </Alert>
                )}
                {/* shortcut: la API no permite recuperar intentos sin número de pedido; evitar reenvíos hasta verificar si el pedido se creó. */}
                {state.pending && !submitting ? (
                  <section
                    className="space-y-4 rounded-2xl bg-niebla p-6"
                    aria-label="Confirmación pendiente"
                  >
                    <Alert>
                      {error ||
                        'No podemos verificar si la confirmación pendiente se completó. Verificá que el pedido no se haya creado antes de volver a enviarlo.'}
                    </Alert>
                    <p>Conservamos los productos. No se volverá a enviar el pedido automáticamente.</p>
                    <p>El intento queda guardado en esta pestaña incluso al reiniciar el servidor.</p>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={verified}
                        onChange={(event) => setVerified(event.target.checked)}
                      />
                      Verifiqué que este pedido no se creó.
                    </label>
                    <Button
                      type="button"
                      disabled={!verified}
                      onClick={() => {
                        releaseConfirmation()
                        setVerified(false)
                        setError(null)
                        setResult(null)
                        setAttempt((value) => value + 1)
                      }}
                    >
                      Habilitar un nuevo intento
                    </Button>
                  </section>
                ) : (
                  <>
                    {(error || current?.error) && <Alert>{error || current?.error}</Alert>}
                    {current?.error && (
                      <Button
                        type="button"
                        onClick={() => {
                          setResult(null)
                          setAttempt((value) => value + 1)
                        }}
                      >
                        Reintentar cotización
                      </Button>
                    )}
                    {!quote && input.destination && !current?.error && (
                      <p role="status" className="text-sm text-musgo">
                        Calculando recorrido, precios y disponibilidad…
                      </p>
                    )}
                    <PaymentForm
                      amount={quote?.subtotal ?? 0}
                      restaurantName={quote?.restaurantName ?? ''}
                      loading={!quote}
                      loadingLabel={
                        !input.destination
                          ? 'Indicá el destino para continuar'
                          : current?.error
                            ? 'No pudimos calcular la entrega'
                            : undefined
                      }
                      submitting={submitting}
                      onPay={(method) => void confirm(method)}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </CatalogLayout>
  )
}
