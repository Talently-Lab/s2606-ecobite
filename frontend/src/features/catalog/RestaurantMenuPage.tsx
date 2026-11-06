import { ArrowLeft, MapPin, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, TextField } from '@/shared/components/ui'
import { useOrders, editDraft, changeDraftQuantity } from '@/shared/lib/orderDraft'
import { ROUTES } from '@/shared/config/routes'
import { loadMenu } from './menuCache'
import { CatalogLayout, FoodImage, LoadingState, RetryButton } from './catalogComponents'
import { formatPrice } from './formatPrice'
import type { RestaurantMenu } from './types'

export function RestaurantMenuPage() {
  const { id } = useParams()
  return <RestaurantMenuContent key={id} id={id ?? ''} />
}

function RestaurantMenuContent({ id }: { id: string }) {
  const orders = useOrders()
  const draft = orders.drafts[Number(id)]
  const validId = /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0
  const [result, setResult] = useState<{ data?: RestaurantMenu; error?: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const search = draft?.search ?? ''
  const category = draft?.category ?? ''
  const cart = draft?.items ?? {}
  useEffect(() => {
    if (!validId) return
    let active = true
    loadMenu(Number(id), attempt > 0).then(
      (data) => {
        if (active) setResult({ data })
      },
      (error: unknown) => {
        if (active)
          setResult({ error: error instanceof Error ? error.message : 'No pudimos cargar el menú.' })
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
  const changeQty = (dishId: number, delta: number) => {
    if (data) changeDraftQuantity(Number(id), data.restaurant.name, dishId, delta)
  }
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
          <section className="menu-banner space-y-3">
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
          <div className="min-w-0">
            <section aria-label="Platos del restaurante" className="min-w-0 space-y-4">
              <TextField
                label="Buscar platos"
                type="search"
                value={search}
                onChange={(event) =>
                  editDraft(Number(id), data.restaurant.name, { search: event.target.value })
                }
              />
              <div className="flex flex-wrap gap-2" aria-label="Categorías de platos">
                {['', ...categories].map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={category === name}
                    onClick={() => editDraft(Number(id), data.restaurant.name, { category: name })}
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
                  <article key={dish.id} className="dish-card">
                    <h2 className="text-xl font-semibold">{dish.name}</h2>
                    <FoodImage src={dish.imageUrl} alt={dish.name} />
                    {dish.category && <p className="text-musgo">{dish.category}</p>}
                    <p>{formatPrice(dish.price)}</p>
                    {(cart[dish.id] ?? 0) > 0 ? (
                      <div className="quantity-picker" role="group" aria-label={`Cantidad de ${dish.name}`}>
                        <button
                          type="button"
                          disabled={!!orders.pending}
                          aria-label={`Quitar una unidad de ${dish.name}`}
                          onClick={() => changeQty(dish.id, -1)}
                        >
                          <Minus size={18} aria-hidden="true" />
                        </button>
                        <span aria-live="polite">{cart[dish.id]}</span>
                        <button
                          type="button"
                          disabled={!!orders.pending || (cart[dish.id] ?? 0) >= 20}
                          aria-label={`Agregar una unidad de ${dish.name}`}
                          onClick={() => changeQty(dish.id, 1)}
                        >
                          <Plus size={18} aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        disabled={!!orders.pending}
                        onClick={() => changeQty(dish.id, 1)}
                        aria-label={`Agregar ${dish.name} al pedido`}
                      >
                        <Plus size={18} aria-hidden="true" /> Agregar al pedido
                      </Button>
                    )}
                  </article>
                ))
              )}
            </section>
          </div>
        </>
      )}
    </CatalogLayout>
  )
}
