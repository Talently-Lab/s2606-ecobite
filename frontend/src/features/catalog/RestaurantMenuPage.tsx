import { ArrowLeft, Leaf, MapPin, Minus, Plus, Star } from 'lucide-react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Link, useLocation, useNavigationType, useParams } from 'react-router-dom'
import { Alert, Button, TextField } from '@/shared/components/ui'
import { useOrders, editDraft, changeDraftQuantity } from '@/shared/lib/orderDraft'
import { ROUTES } from '@/shared/config/routes'
import { loadMenu } from './menuCache'
import { CatalogLayout, FoodImage, LoadingState, RetryButton } from './catalogComponents'
import { formatPrice } from './formatPrice'
import { RestaurantReviews } from './RestaurantReviews'
import type { RestaurantMenu } from './types'

const menuScrollPositions = new Map<string, number>()

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
  const navigationType = useNavigationType()
  const restoreScroll = useLocation().state?.restoreMenuScroll === true
  useLayoutEffect(() => {
    if (!data) return
    const top = navigationType === 'POP' || restoreScroll ? menuScrollPositions.get(id) : 0
    if (top !== undefined) window.scrollTo({ top, behavior: 'instant' })
    return () => {
      menuScrollPositions.set(id, window.scrollY)
    }
  }, [data, id, navigationType, restoreScroll])
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
          <header className="menu-banner">
            <div className="min-w-0 space-y-2">
              <h1 className="font-display font-semibold">{data.restaurant.name}</h1>
              <p className="flex items-center gap-2 text-sm text-musgo">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {data.restaurant.address}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-musgo">
                {data.restaurant.biodegradablePackaging && (
                  <span className="inline-flex items-center gap-1 text-bosque">
                    <Leaf size={16} aria-hidden="true" /> Envase biodegradable
                  </span>
                )}
                {data.restaurant.estimatedDeliveryMinutes !== null && (
                  <span>Entrega estimada: {data.restaurant.estimatedDeliveryMinutes} min</span>
                )}
                <a href="#valoraciones" className="inline-flex min-h-11 items-center gap-1 underline">
                  {data.restaurant.rating !== null && (
                    <>
                      <Star size={16} aria-hidden="true" />
                      {data.restaurant.rating.toLocaleString('es-AR', { maximumFractionDigits: 1 })} / 5
                      ·{' '}
                    </>
                  )}
                  Ver reseñas
                </a>
              </div>
            </div>
            <FoodImage src={data.restaurant.imageUrl} alt={data.restaurant.name} />
          </header>
          <div className="min-w-0">
            <section aria-label="Platos del restaurante" className="min-w-0 space-y-4">
              <div className="menu-filters">
                <TextField
                  className="menu-search"
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
              </div>
              {dishes.length === 0 ? (
                <p role="status">Este restaurante todavía no tiene platos disponibles.</p>
              ) : filtered.length === 0 ? (
                <p role="status">No hay platos que coincidan con tu búsqueda.</p>
              ) : (
                filtered.map((dish) => (
                  <article key={dish.id} className="dish-card">
                    <FoodImage src={dish.imageUrl} alt={dish.name} />
                    <div className="dish-details">
                      <h2 className="font-semibold">{dish.name}</h2>
                      {!category && dish.category && <p className="text-sm text-musgo">{dish.category}</p>}
                      <p className="font-semibold">{formatPrice(dish.price)}</p>
                    </div>
                    <div className="dish-actions">
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
                          className="px-4 py-2"
                          disabled={!!orders.pending}
                          onClick={() => changeQty(dish.id, 1)}
                          aria-label={`Agregar ${dish.name} al pedido`}
                        >
                          <Plus size={18} aria-hidden="true" /> Agregar
                        </Button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>
          </div>
          <RestaurantReviews restaurantId={Number(id)} />
        </>
      )}
    </CatalogLayout>
  )
}
