import { useEffect, useState } from 'react'
import type { Restaurant } from '../types'
import { fetchRoute, type Coordinates, type RouteResult } from './routeService'
import { useDestination } from './deliveryDestination'
export function useDeliveryEstimate(
  selection: { id: number } | null,
  restaurant: (Restaurant & Coordinates) | undefined,
) {
  const destination = useDestination()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ key: string; route?: RouteResult; error?: string } | null>(null)
  const key = JSON.stringify([selection?.id, destination])
  const active = result?.key === key ? result : null
  useEffect(() => {
    if (!destination || !restaurant) return
    let disposed = false
    void fetchRoute(restaurant.id, destination).then(
      (route) => {
        if (!disposed) setResult({ key, route })
      },
      (error: unknown) => {
        if (!disposed)
          setResult({
            key,
            error: error instanceof Error ? error.message : 'No pudimos calcular el recorrido.',
          })
      },
    )
    return () => {
      disposed = true
    }
  }, [destination, restaurant, key, attempt])
  return {
    destination,
    route: active?.route,
    error: active?.error,
    retry() {
      setAttempt((value) => value + 1)
    },
  }
}
