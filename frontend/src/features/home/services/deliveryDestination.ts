import { getOrders, setOrderDestination, useOrders, type DeliveryDestination } from '@/shared/lib/orderDraft'
import { requestCurrentPosition } from './routeService'
export const getDestination = () => getOrders().destination
export function useDestination() {
  return useOrders().destination
}
export function setDestination(point: DeliveryDestination | null) {
  setOrderDestination(point)
}
export async function requestDestination() {
  const { latitude, longitude } = await requestCurrentPosition()
  const point = { latitude, longitude, label: 'Mi ubicación actual' }
  setDestination(point)
  return point
}
