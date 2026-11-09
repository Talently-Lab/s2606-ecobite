import { useEffect, useState } from 'react'
import { SiteHeader } from '@/shared/components/SiteHeader'
import { catalogService } from '@/features/catalog'
import { RestaurantMap } from '../components/RestaurantMap'
import type { Restaurant } from '../types'

export function RestaurantMapPage() {
  const [result, setResult] = useState<{ data?: Restaurant[]; error?: string } | null>(null)

  useEffect(() => {
    let active = true
    catalogService.list('', '').then(
      ({ data }) => {
        if (active) setResult({ data })
      },
      (error: unknown) => {
        if (active)
          setResult({ error: error instanceof Error ? error.message : 'No pudimos cargar los restaurantes.' })
      },
    )
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="restaurant-map-page">
      <SiteHeader />
      <main aria-label="Mapa de restaurantes">
        <RestaurantMap restaurants={result?.data ?? []} loading={!result} error={result?.error ?? null} />
      </main>
    </div>
  )
}
