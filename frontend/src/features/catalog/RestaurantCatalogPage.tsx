import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert, TextField } from '@/shared/components/ui'
import { catalogService } from './catalogService'
import { CatalogLayout, LoadingState, RetryButton } from './catalogComponents'
import type { CatalogRestaurant } from './types'
import { RestaurantList } from './RestaurantList'

export function RestaurantCatalogPage() {
  const [params, setParams] = useSearchParams()
  const selected = params.get('restaurante')
  const selectedId =
    selected !== null && /^[1-9]\d*$/.test(selected) && Number.isSafeInteger(Number(selected))
      ? Number(selected)
      : null
  const search = params.get('search') ?? ''
  const category = params.get('categoria') ?? ''
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
  const changeFilter = (field: string, value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(field, value)
        else next.delete(field)
        next.delete('pagina')
        return next
      },
      { replace: true },
    )
  const clearSelection = () =>
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.delete('restaurante')
      next.delete('pagina')
      return next
    })
  return (
    <CatalogLayout>
      <header className="space-y-2">
        <h1 className="font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
          ¿Qué se te antoja hoy?
        </h1>
        <p className="text-musgo">Elegí un local y armá tu pedido.</p>
      </header>
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
              onChange={(event) => changeFilter('search', event.target.value)}
              placeholder="Nombre o dirección"
            />
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Categoría
            <select
              className="min-h-12 rounded-xl border border-borde bg-white px-4"
              value={category}
              onChange={(event) => changeFilter('categoria', event.target.value)}
            >
              <option value="">Todas</option>
              {['Bowls', 'Ensaladas', 'Wraps'].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="restaurant-results">
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
        {!!restaurants?.length && (
          <RestaurantList
            key={JSON.stringify([requestSearch, requestCategory, selected])}
            restaurants={restaurants}
          />
        )}
      </div>
    </CatalogLayout>
  )
}
