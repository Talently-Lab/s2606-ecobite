import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CatalogLayout, formatPrice } from '@/features/catalog'
import { Alert } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'
import { panelService } from '../panelService'
import type { GroupConfirmation } from '../types'

export function GroupConfirmationPage() {
  const { id = '' } = useParams()
  const [result, setResult] = useState<{ id: string; data?: GroupConfirmation; error?: string } | null>(null)
  useEffect(() => {
    let active = true
    void panelService
      .groupConfirmation(id)
      .then(({ data }) => {
        if (active) setResult({ id, data })
      })
      .catch((error: unknown) => {
        if (active)
          setResult({
            id,
            error: error instanceof Error ? error.message : 'No pudimos recuperar la confirmación.',
          })
      })
    return () => {
      active = false
    }
  }, [id])
  const current = result?.id === id ? result : null
  return (
    <CatalogLayout>
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-10">
        <h1 className="font-display text-3xl font-semibold">
          {current?.data ? '¡Pedidos confirmados!' : 'Confirmación de tus pedidos'}
        </h1>
        {!current && <p role="status">Recuperando confirmación…</p>}
        {current?.error && <Alert>{current.error}</Alert>}
        {current?.data && (
          <>
            <p>Cada restaurante prepara su pedido por separado.</p>
            <p className="break-all text-xs text-musgo">Conjunto: {current.data.groupId}</p>
            {current.data.orders.map((order) => (
              <section className="space-y-3 rounded-2xl border border-borde bg-white p-6" key={order.id}>
                <h2 className="font-display text-xl font-semibold">{order.restaurant.name}</h2>
                <p className="text-sm text-musgo">Pedido n.º {order.id}</p>
                {order.items.map((item) => (
                  <p className="flex justify-between gap-4" key={item.dishId}>
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </p>
                ))}
                <p className="flex justify-between border-t border-borde pt-3 font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total)}</span>
                </p>
              </section>
            ))}
            <div className="space-y-3 rounded-2xl bg-niebla p-6">
              <p className="flex justify-between gap-4 font-semibold">
                <span>Subtotal confirmado</span>
                <span>{formatPrice(current.data.subtotal)}</span>
              </p>
              <p>
                Impacto de estos pedidos:{' '}
                {current.data.environmentalImpact.co2SavedKg.toLocaleString('es-AR')} kg de CO₂
              </p>
              <Link to={ROUTES.impact} className="inline-flex min-h-11 items-center underline">
                Ver mi impacto
              </Link>
            </div>
          </>
        )}
        <Link to={ROUTES.restaurants} className="eco-button">
          Seguir explorando restaurantes
        </Link>
      </div>
    </CatalogLayout>
  )
}
