import { useEffect, useState, useSyncExternalStore } from 'react'
import type { Restaurant } from '../types'
import { fetchRoute, type Coordinates, type RouteResult } from './routeService'
import {
  getDestination,
  requestDestination,
  requestInitialDestination,
  setDestination,
  subscribeDestination,
} from './deliveryDestination'

export function useDeliveryEstimate(
  selection: { id: number } | null,
  restaurant: (Restaurant & Coordinates) | undefined,
) {
  const destination = useSyncExternalStore(subscribeDestination, getDestination)
  const [locationFailure, setLocationFailure] = useState<{
    selection: typeof selection
    attempt: number
    message: string
  } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ key: string; route?: RouteResult; error?: string } | null>(null)
  const key =
    destination && restaurant
      ? `${destination.latitude},${destination.longitude}:${restaurant.id},${restaurant.latitude},${restaurant.longitude}`
      : null
  const active = result?.key === key ? result : null

  useEffect(() => {
    if (destination) return
    let disposed = false
    const request = selection ? requestDestination() : requestInitialDestination()
    void request.catch((error: unknown) => {
      if (!disposed)
        setLocationFailure({
          selection,
          attempt,
          message: error instanceof Error ? error.message : 'No pudimos obtener tu ubicación.',
        })
    })
    return () => {
      disposed = true
    }
  }, [destination, selection, attempt])

  useEffect(() => {
    if (!navigator.permissions?.query) return
    let disposed = false
    let permission: PermissionStatus | undefined
    const update = () => {
      if (permission?.state === 'denied') setDestination(null)
    }
    void navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        if (disposed) return
        permission = status
        update()
        permission.addEventListener('change', update)
      })
      .catch(() => {
        /* getCurrentPosition handles browsers without Permissions API. */
      })
    return () => {
      disposed = true
      permission?.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    if (!destination || !restaurant || !key) return
    let disposed = false
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12000)
    void fetchRoute(restaurant, destination, controller.signal)
      .then((route) => {
        if (!disposed) setResult({ key, route })
      })
      .catch(() => {
        if (!disposed) setResult({ key, error: 'No pudimos calcular la ruta. Intentá de nuevo.' })
      })
      .finally(() => window.clearTimeout(timeout))
    return () => {
      disposed = true
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [destination, restaurant, key, attempt])

  return {
    destination,
    route: active?.route,
    error: destination
      ? active?.error
      : locationFailure?.selection === selection && locationFailure?.attempt === attempt
        ? locationFailure.message
        : null,
    retry() {
      setLocationFailure(null)
      setResult(null)
      setAttempt((value) => value + 1)
    },
  }
}
