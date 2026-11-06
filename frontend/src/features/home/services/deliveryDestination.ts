import { requestCurrentPosition, type Coordinates } from './routeService'

// Navigation keeps the location in memory; a reload discards it.
let destination: Coordinates | null = null
let initialRequestMade = false
let pending: Promise<Coordinates> | null = null
const listeners = new Set<() => void>()
export const getDestination = () => destination
export function subscribeDestination(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function setDestination(next: Coordinates | null) {
  destination = next
  listeners.forEach((listener) => listener())
}
export function requestDestination(): Promise<Coordinates> {
  if (destination) return Promise.resolve(destination)
  pending ??= requestCurrentPosition()
    .then(({ latitude, longitude }) => {
      const point = { latitude, longitude }
      setDestination(point)
      return point
    })
    .finally(() => {
      pending = null
    })
  return pending
}
export function requestInitialDestination() {
  if (initialRequestMade) return pending ?? Promise.resolve(destination)
  initialRequestMade = true
  return requestDestination()
}
