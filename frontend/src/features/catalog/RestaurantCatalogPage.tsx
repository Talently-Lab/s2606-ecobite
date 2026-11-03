import { ArrowRight, MapPin, Leaf } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, TextField } from '@/shared/components/ui'
import { restaurantMenuUrl } from '@/shared/config/routes'
import { catalogService } from './catalogService'
import { CatalogLayout, FoodImage, LoadingState, RetryButton } from './components'
import type { CatalogRestaurant } from './types'

export function RestaurantCatalogPage() {
  const [params, setParams] = useSearchParams()
  const selected = params.get('restaurante')
  const selectedId =
    selected !== null && /^[1-9]\d*$/.test(selected) && Number.isSafeInteger(Number(selected))
      ? Number(selected)
      : null
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: CatalogRestaurant[]; error?: string } | null>(
    null,
  )
  const requestSearch = selected === null ? search : ''
  const requestCategory = selected === null ? category : ''
  const key = JSON.stringify([requestSearch, requestCategory, attempt])
  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      catalogService.list(requestSearch, requestCategory).then(
        ({ data }) => {
          if (active) setResult({ key, data })
        },
        (error: unknown) => {
          if (active)
            setResult({
              key,
              error: error instanceof Error ? error.message : 'No pudimos cargar los restaurantes.',
            })
        },
      )
    }, 300)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [requestSearch, requestCategory, attempt, key])
  const current = result?.key === key ? result : null
  const restaurants = current?.data?.filter((restaurant) => selected === null || restaurant.id === selectedId)
  const clearSelection = () =>
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.delete('restaurante')
      return next
    })
  return (
    <CatalogLayout>
      <div className="page-intro">
        <span className="eyebrow">SEGUÍ TU ANTOJO</span>
        <h1 className="font-display text-3xl font-semibold">Restaurantes</h1>
        <p className="mt-2 text-musgo">Encontrá tu próxima comida y conocé su impacto.</p>
      </div>
      {selected !== null ? (
        <div className="catalog-selection">
          <div>
            <span className="eyebrow">LOCAL SELECCIONADO</span>
            <p>{restaurants?.[0]?.name ?? 'Selección desde el mapa'}</p>
          </div>
          <button type="button" className="eco-button" onClick={clearSelection}>
            Ver todos
          </button>
        </div>
      ) : (
        <div className="catalog-filters flex flex-wrap items-end gap-4">
          <div className="min-w-0 flex-1">
            <TextField
              label="Buscar restaurantes"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre o dirección"
            />
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Categoría
            <select
              className="min-h-12 rounded-xl border border-borde bg-white px-4"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Todas</option>
              {['Bowls', 'Ensaladas', 'Wraps'].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {!current && <LoadingState text="Cargando restaurantes…" />}
      {current?.error && (
        <>
          <Alert>{current.error}</Alert>
          <RetryButton onClick={() => setAttempt((value) => value + 1)} />
        </>
      )}
      {restaurants?.length === 0 && (
        <p role="status" className="empty-state">
          {selected !== null
            ? 'El restaurante seleccionado no está disponible. Elegí «Ver todos» para explorar otros locales.'
            : 'No encontramos restaurantes con estos filtros.'}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants?.map((restaurant) => (
          <article key={restaurant.id} className="catalog-card space-y-3">
            <FoodImage src={restaurant.imageUrl} alt={restaurant.name} />
            <h2 className="font-display text-xl font-semibold">
              <Link to={restaurantMenuUrl(restaurant.id)}>{restaurant.name}</Link>
            </h2>
            <p className="flex items-center gap-2 text-musgo">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {restaurant.address}
            </p>
            {restaurant.category && <p>{restaurant.category}</p>}
            <p>Indicador ecológico: {restaurant.ecoIndicator}</p>
            {restaurant.biodegradablePackaging && (
              <p className="flex items-center gap-2 text-bosque">
                <Leaf className="size-4" aria-hidden="true" />
                Envase biodegradable
              </p>
            )}
            {restaurant.rating !== null && <p>Valoración: {restaurant.rating}</p>}
            {restaurant.estimatedDeliveryMinutes !== null && (
              <p>Entrega estimada: {restaurant.estimatedDeliveryMinutes} min</p>
            )}
            <Link
              className="inline-flex min-h-11 items-center gap-2 font-semibold underline"
              to={restaurantMenuUrl(restaurant.id)}
            >
              Ver menú de {restaurant.name}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </CatalogLayout>
  )
}
