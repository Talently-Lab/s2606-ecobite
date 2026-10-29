import { ArrowLeft, Leaf, MapPin, Minus, Plus, ShoppingCart, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { ApiError } from '@/shared/lib/http'
import { Alert, Button, TextField } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'
import { catalogService } from './catalogService'
import { CatalogLayout, FoodImage, LoadingState, RetryButton } from './components'
import { formatPrice } from './format'
import type { RestaurantMenu } from './types'

export function RestaurantMenuPage() {
  const { id } = useParams()
  const { usuario } = useAuth()
  // Remount the order when its restaurant or owner changes.
  return <RestaurantMenuContent key={`${id}:${usuario?.id_usuario}`} id={id ?? ''} />
}

function RestaurantMenuContent({ id }: { id: string }) {
  const validId = /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0
  const [result, setResult] = useState<{ data?: RestaurantMenu; error?: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [cart, setCart] = useState<Record<number, number>>({})
  useEffect(() => {
    if (!validId) return
    let active = true
    catalogService.menu(Number(id)).then(
      ({ data }) => {
        if (active) setResult({ data })
      },
      (error: unknown) => {
        if (active)
          setResult({
            error:
              error instanceof ApiError && error.status === 404
                ? 'Restaurante no encontrado o inactivo.'
                : error instanceof Error
                  ? error.message
                  : 'No pudimos cargar el menú.',
          })
      },
    )
    return () => {
      active = false
    }
  }, [id, validId, attempt])
  const data = result?.data
  const dishes = data?.dishes.filter((dish) => dish.available) ?? []
  const categories = [
    ...new Set(dishes.map((dish) => dish.category).filter((value): value is string => Boolean(value))),
  ]
  const filtered = dishes.filter(
    (dish) =>
      (!category || dish.category === category) &&
      dish.name.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')),
  )
  const items = dishes.filter((dish) => (cart[dish.id] ?? 0) > 0)
  const count = items.reduce((sum, dish) => sum + (cart[dish.id] ?? 0), 0)
  const subtotal = items.reduce((sum, dish) => sum + dish.price * (cart[dish.id] ?? 0), 0)
  const co2 = items.reduce((sum, dish) => sum + dish.co2SavedPerUnit * (cart[dish.id] ?? 0), 0)
  const changeQty = (dishId: number, delta: number) =>
    setCart((previous) => {
      const next = { ...previous }
      const quantity = Math.max(0, (next[dishId] ?? 0) + delta)
      if (quantity === 0) delete next[dishId]
      else next[dishId] = quantity
      return next
    })
  return (
    <CatalogLayout>
      <Link to={ROUTES.restaurants} className="inline-flex min-h-11 items-center gap-2">
        <ArrowLeft className="size-5" aria-hidden="true" /> Volver a restaurantes
      </Link>
      {!validId ? (
        <Alert>El identificador del restaurante no es válido.</Alert>
      ) : !result ? (
        <LoadingState text="Cargando menú…" />
      ) : result.error ? (
        <>
          <Alert>{result.error}</Alert>
          <RetryButton
            onClick={() => {
              setResult(null)
              setAttempt((value) => value + 1)
            }}
          />
        </>
      ) : null}
      {data && (
        <>
          <section className="space-y-3 rounded-2xl bg-white p-6">
            <FoodImage src={data.restaurant.imageUrl} alt={data.restaurant.name} />
            <p className="text-sm text-musgo">Menú del restaurante</p>
            <h1 className="font-display text-3xl font-semibold">{data.restaurant.name}</h1>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {data.restaurant.address}
            </p>
            <p>Indicador ecológico: {data.restaurant.ecoIndicator}</p>
            {data.restaurant.biodegradablePackaging && <p className="text-bosque">Envase biodegradable</p>}
            {data.restaurant.rating !== null && <p>Valoración: {data.restaurant.rating}</p>}
            {data.restaurant.estimatedDeliveryMinutes !== null && (
              <p>Entrega estimada: {data.restaurant.estimatedDeliveryMinutes} min</p>
            )}
          </section>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section aria-label="Platos del restaurante" className="min-w-0 space-y-4">
              <TextField
                label="Buscar platos"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="flex flex-wrap gap-2" aria-label="Categorías de platos">
                {['', ...categories].map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={category === name}
                    onClick={() => setCategory(name)}
                    className={`min-h-11 rounded-full border border-borde px-4 ${category === name ? 'bg-bosque text-white' : 'bg-white'}`}
                  >
                    {name || 'Todos'}
                  </button>
                ))}
              </div>
              {dishes.length === 0 ? (
                <p role="status">Este restaurante todavía no tiene platos disponibles.</p>
              ) : filtered.length === 0 ? (
                <p role="status">No hay platos que coincidan con tu búsqueda.</p>
              ) : (
                filtered.map((dish) => (
                  <article key={dish.id} className="space-y-3 rounded-2xl border border-borde bg-white p-5">
                    <h2 className="text-xl font-semibold">{dish.name}</h2>
                    {dish.imageUrl && <FoodImage src={dish.imageUrl} alt={dish.name} />}
                    {dish.category && <p className="text-musgo">{dish.category}</p>}
                    <p>{formatPrice(dish.price)}</p>
                    <Button
                      type="button"
                      onClick={() => changeQty(dish.id, 1)}
                      aria-label={`Agregar ${dish.name} al pedido`}
                    >
                      <Plus className="size-5" aria-hidden="true" /> Agregar al pedido
                    </Button>
                  </article>
                ))
              )}
            </section>
            <aside
              aria-label="Carrito"
              className="space-y-4 rounded-2xl border border-borde bg-white p-5 lg:sticky lg:top-4"
            >
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <ShoppingCart className="size-5" aria-hidden="true" />
                Tu pedido
              </h2>
              <p role="status" aria-live="polite">
                {count === 0 ? 'Tu carrito está vacío.' : `${count} unidades en tu carrito`}
              </p>
              {items.map((dish) => (
                <div key={dish.id} className="space-y-2 border-b border-borde pb-4">
                  <h3 className="font-semibold">{dish.name}</h3>
                  <p>{formatPrice(dish.price * (cart[dish.id] ?? 0))}</p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="flex size-11 items-center justify-center rounded-full border border-borde"
                      aria-label={`Quitar una unidad de ${dish.name}`}
                      onClick={() => changeQty(dish.id, -1)}
                    >
                      <Minus className="size-5" aria-hidden="true" />
                    </button>
                    <span aria-label={`Cantidad de ${dish.name}`}>{cart[dish.id]}</span>
                    <button
                      type="button"
                      className="flex size-11 items-center justify-center rounded-full border border-borde"
                      aria-label={`Agregar una unidad de ${dish.name}`}
                      onClick={() => changeQty(dish.id, 1)}
                    >
                      <Plus className="size-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
              <p className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </p>
              <p className="flex items-center gap-2 rounded-xl bg-niebla p-3">
                <Leaf className="size-5 shrink-0 text-bosque" aria-hidden="true" />
                CO₂ estimado del pedido: {co2.toLocaleString('es-AR', { maximumFractionDigits: 3 })} kg
              </p>
              <p className="text-sm text-musgo">
                Estimación según los platos seleccionados. No se suma a tu impacto hasta completar un pedido.
              </p>
              <Button disabled type="button" aria-describedby="checkout-pending" className="w-full">
                <CreditCard className="size-5" aria-hidden="true" /> Ir a pagar
              </Button>
              <p id="checkout-pending" className="text-sm text-musgo">
                El checkout está pendiente de integración. Aún no se pueden confirmar ni pagar pedidos.
              </p>
            </aside>
          </div>
        </>
      )}
    </CatalogLayout>
  )
}
