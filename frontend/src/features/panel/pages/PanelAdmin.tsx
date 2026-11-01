import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert } from '@/shared/components/ui'
import { formatPrice } from '@/features/catalog'
import { panelService } from '../panelService'
import type { AdminDashboard } from '../types'

export function PanelAdmin() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    panelService
      .dashboard()
      .then(({ data }) => setDashboard(data))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'No pudimos cargar el panel administrativo.')
      })
  }, [])

  if (error)
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Alert>{error}</Alert>
      </main>
    )
  if (!dashboard)
    return (
      <main className="flex min-h-screen items-center justify-center gap-2 text-musgo">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Cargando panel…
      </main>
    )

  const { summary, recentOrders } = dashboard
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header>
        <p className="text-sm text-musgo">EcoBite</p>
        <h1 className="font-display text-4xl font-semibold">Panel administrativo</h1>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="CO₂ ahorrado" value={`${summary.co2SavedKg.toLocaleString('es-AR')} kg`} />
        <Metric label="Pedidos" value={summary.ordersCount.toLocaleString('es-AR')} />
        <Metric label="Locales activos" value={summary.activeRestaurantsCount.toLocaleString('es-AR')} />
        <Metric label="Ticket promedio" value={formatPrice(summary.averageTicket)} />
      </section>
      <section className="space-y-4 rounded-3xl bg-white p-7">
        <h2 className="font-display text-2xl font-semibold">Últimos pedidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="text-sm text-musgo">
              <tr>
                <th className="pb-3">Pedido</th>
                <th>Cliente</th>
                <th>Restaurante</th>
                <th>Total</th>
                <th>CO₂</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-borde">
                  <td className="py-4">#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.restaurant}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>{order.co2SavedKg === null ? '—' : `${order.co2SavedKg} kg`}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white p-5">
      <p className="text-sm text-musgo">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </article>
  )
}
