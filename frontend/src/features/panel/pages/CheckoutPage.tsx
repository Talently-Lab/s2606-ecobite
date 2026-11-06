import { CatalogLayout, formatPrice, refreshCartMenus } from '@/features/catalog'
import { useAuth } from '@/features/auth'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { groupConfirmationUrl, ROUTES, restaurantMenuUrl } from '@/shared/config/routes'
import { panelService } from '../panelService'
import type { GroupQuote } from '../types'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const state = useOrders()
  const inputs = useMemo(() => cartInputs(state), [state])
  const key = JSON.stringify(inputs)
  const [result, setResult] = useState<{ key: string; quote?: GroupQuote; error?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const busy = useRef(false)
  const [attempt, setAttempt] = useState(0)
  const current = result?.key === key ? result : null
  const quote = current?.quote
  useEffect(() => {
    if (!inputs.length || state.pending) return
    let active = true
    void panelService
      .quoteGroup(inputs)
      .then(({ data }) => {
        if (active) setResult({ key, quote: data })
      })
      .catch((reason: unknown) => {
        if (active && reason instanceof ApiError && reason.status === 401) {
          logout({ preserveCart: true })
          navigate(ROUTES.login, { state: { from: ROUTES.checkout }, replace: true })
          return
        }
        if (active && reason instanceof ApiError && [400, 404].includes(reason.status))
          void refreshCartMenus(inputs.map((order) => order.restaurantId))
        if (active)
          setResult({
            key,
            error: reason instanceof Error ? reason.message : 'No pudimos actualizar el carrito.',
          })
      })
    return () => {
      active = false
    }
  }, [inputs, key, attempt, state.pending, logout, navigate])

  async function confirm() {
    if (busy.current || (!quote && !state.pending)) return
    busy.current = true
    setSubmitting(true)
    setError(null)
    const pending = state.pending ?? beginConfirmation(Math.round(quote!.subtotal * 100))
    try {
      const { data } = await panelService.createGroup(pending)
      if (getOrders().pending?.key !== pending.key) return
      finishConfirmation()
      navigate(groupConfirmationUrl(data.groupId), { replace: true })
    } catch (reason) {
      if (reason instanceof ApiError && reason.status >= 400 && reason.status < 500) {
        releaseConfirmation()
        if (reason.status === 401) {
          logout({ preserveCart: true })
          navigate(ROUTES.login, { state: { from: ROUTES.checkout }, replace: true })
          return
        }
        setResult(null)
        setAttempt((value) => value + 1)
      }
      setError(
        reason instanceof Error
          ? reason.message
          : 'No recibimos la confirmación. Recuperá el resultado sin volver a armar el carrito.',
      )
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  return (
    <CatalogLayout>
      <div className="checkout-shell mx-auto w-full max-w-3xl space-y-6 px-5 py-10">
        <Link to={`${ROUTES.restaurants}?carrito=1`} className="inline-flex min-h-11 items-center underline">
          Volver al carrito
        </Link>
        <div>
          <p className="text-sm text-musgo">Último paso</p>
          <h1 className="font-display text-3xl font-semibold">
            {inputs.length ? 'Revisá todos tus pedidos' : 'Tu pedido empieza acá'}
          </h1>
        </div>
        {!inputs.length ? (
          <Alert>Tu carrito está vacío. Elegí platos antes de continuar.</Alert>
        ) : (
          <>
            {!state.storageAvailable && (
              <Alert>
                El carrito no podrá recuperarse al recargar esta pestaña. Conservá esta página hasta recibir
                la confirmación.
              </Alert>
            )}
            {(error || current?.error) && <Alert>{error || current?.error}</Alert>}
            {state.pending && (
              <p role="status" className="rounded-xl bg-niebla p-4">
                Estamos recuperando una confirmación pendiente. Usaremos el mismo identificador para evitar
                pedidos duplicados.
              </p>
            )}
            {!quote && !state.pending && !current?.error && (
              <p role="status">Actualizando precios y disponibilidad…</p>
            )}
            {current?.error && (
              <>
                <Button type="button" onClick={() => setAttempt((value) => value + 1)}>
                  Reintentar cotización
                </Button>
                <p className="text-sm text-musgo">
                  Si algún plato dejó de estar disponible, volvé al carrito para revisarlo.
                </p>
              </>
            )}
            {quote?.groups.map((group) => (
              <section
                className="space-y-4 rounded-2xl border border-borde bg-white p-6"
                key={group.restaurantId}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold">{group.restaurantName}</h2>
                  <Link
                    className="min-h-11 inline-flex items-center underline"
                    to={restaurantMenuUrl(group.restaurantId)}
                  >
                    Ver menú
                  </Link>
                </div>
                {group.items.map((item) => (
                  <div key={item.dishId} className="flex justify-between gap-4">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                <p className="flex justify-between border-t border-borde pt-3 font-semibold">
                  <span>Subtotal del restaurante</span>
                  <span>{formatPrice(group.subtotal)}</span>
                </p>
              </section>
            ))}
            {(quote || state.pending) && (
              <section className="space-y-4 rounded-2xl bg-niebla p-6">
                <p className="flex justify-between gap-4 font-semibold">
                  <span>Subtotal de productos</span>
                  <span>
                    {formatPrice(state.pending ? state.pending.expectedSubtotalCents / 100 : quote!.subtotal)}
                  </span>
                </p>
                <p className="text-sm text-musgo">
                  El envío no está calculado. Cada restaurante prepara su pedido por separado. Esta es una
                  simulación; no se realiza un cobro.
                </p>
                <Button type="button" className="w-full" disabled={submitting} onClick={() => void confirm()}>
                  {submitting
                    ? 'Confirmando…'
                    : state.pending
                      ? 'Recuperar confirmación'
                      : 'Confirmar pedidos'}
                </Button>
                <p className="text-sm text-musgo">
                  Se confirman todos juntos. Si alguno no puede crearse, no se crea ninguno.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </CatalogLayout>
  )
}
