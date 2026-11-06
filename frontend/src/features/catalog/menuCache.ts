import { useSyncExternalStore } from 'react'
import { catalogService } from './catalogService'
import type { RestaurantMenu } from './types'
import { reconcileDraft } from '@/shared/lib/orderDraft'

interface Entry {
  data?: RestaurantMenu
  error?: string
  updated: number
}
let entries: Record<number, Entry> = {}
const pending = new Map<number, Promise<RestaurantMenu>>()
const listeners = new Set<() => void>()
function publish(id: number, entry: Entry) {
  entries = { ...entries, [id]: entry }
  listeners.forEach((listener) => listener())
}
export function loadMenu(id: number, force = false): Promise<RestaurantMenu> {
  const inflight = pending.get(id)
  if (inflight) return inflight
  const cached = entries[id]
  if (!force && cached?.data && Date.now() - cached.updated < 60000) return Promise.resolve(cached.data)
  const request = catalogService
    .menu(id)
    .then(({ data }) => {
      reconcileDraft(
        id,
        data.dishes.filter((dish) => dish.available).map((dish) => dish.id),
      )
      publish(id, { data, updated: Date.now() })
      return data
    })
    .catch((error: unknown) => {
      publish(id, {
        ...cached,
        updated: 0,
        error: error instanceof Error ? error.message : 'No pudimos actualizar este restaurante.',
      })
      throw error
    })
    .finally(() => pending.delete(id))
  pending.set(id, request)
  return request
}
export function useMenus() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => entries,
  )
}
// Called when the account changes, so no cached cart presentation outlives its session.
export function clearMenuCache() {
  entries = {}
  listeners.forEach((listener) => listener())
}

export async function refreshCartMenus(ids: number[]) {
  await Promise.allSettled(ids.map((id) => loadMenu(id, true)))
}
