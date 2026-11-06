import { useSyncExternalStore } from 'react'

const KEY = 'ecobite.order-drafts.v2'
export interface OrderInput {
  restaurantId: number
  zone: string
  items: { dishId: number; quantity: number }[]
}
export interface OrderDraft {
  restaurantId: number
  name: string
  items: Record<number, number>
  search: string
  category: string
}
export interface PendingConfirmation {
  key: string
  orders: OrderInput[]
  expectedSubtotalCents: number
}
interface OrderState {
  ownerId: number | null
  drafts: Record<number, OrderDraft>
  expandedRestaurantId: number | null
  pending: PendingConfirmation | null
  storageAvailable: boolean
  message: string | null
}
const empty = (): OrderState => ({
  ownerId: null,
  drafts: {},
  expandedRestaurantId: null,
  pending: null,
  storageAvailable: true,
  message: null,
})
let snapshot = empty()
let lastRaw: string | null | undefined
let memoryOnly = false
const listeners = new Set<() => void>()
const positive = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n > 0
export const cartDrafts = (state: OrderState) =>
  Object.values(state.drafts).filter((draft) => Object.keys(draft.items).length > 0)
export const cartInputs = (state: OrderState): OrderInput[] =>
  cartDrafts(state)
    .map((draft) => ({
      restaurantId: draft.restaurantId,
      zone: 'cercana',
      items: Object.entries(draft.items)
        .map(([dishId, quantity]) => ({ dishId: Number(dishId), quantity }))
        .sort((a, b) => a.dishId - b.dishId),
    }))
    .sort((a, b) => a.restaurantId - b.restaurantId)
function decode(raw: string | null): OrderState {
  if (!raw) return empty()
  try {
    const value = JSON.parse(raw)
    if (
      ![1, 2].includes(value?.version) ||
      (value.ownerId !== null && !positive(value.ownerId)) ||
      !value.drafts ||
      typeof value.drafts !== 'object' ||
      Array.isArray(value.drafts)
    )
      return empty()
    const drafts: Record<number, OrderDraft> = {}
    for (const [key, candidate] of Object.entries(value.drafts)) {
      const item = candidate as OrderDraft
      if (
        !positive(Number(key)) ||
        item?.restaurantId !== Number(key) ||
        typeof item.name !== 'string' ||
        typeof item.search !== 'string' ||
        typeof item.category !== 'string' ||
        !item.items ||
        typeof item.items !== 'object' ||
        Array.isArray(item.items)
      )
        continue
      const items = Object.fromEntries(
        Object.entries(item.items).filter(
          ([id, quantity]) => positive(Number(id)) && positive(quantity) && quantity <= 20,
        ),
      )
      drafts[item.restaurantId] = {
        restaurantId: item.restaurantId,
        name: item.name,
        search: item.search,
        category: item.category,
        items,
      }
    }
    const state: OrderState = {
      ...empty(),
      ownerId: value.ownerId,
      drafts,
      expandedRestaurantId: positive(value.expandedRestaurantId) ? value.expandedRestaurantId : null,
    }
    if (value.version === 1 && cartDrafts(state).length)
      state.message =
        'Recuperamos los pedidos de esta pestaña. Revisá los restaurantes y productos antes de continuar.'
    const pending = value.pending
    if (
      pending &&
      typeof pending.key === 'string' &&
      /^[0-9a-f-]{36}$/i.test(pending.key) &&
      Number.isSafeInteger(pending.expectedSubtotalCents) &&
      pending.expectedSubtotalCents >= 0 &&
      JSON.stringify(pending.orders) === JSON.stringify(cartInputs(state))
    )
      state.pending = pending
    return state
  } catch {
    return empty()
  }
}
export function getOrders(): OrderState {
  if (memoryOnly) return snapshot
  try {
    const raw = sessionStorage.getItem(KEY) ?? sessionStorage.getItem('ecobite.order-drafts.v1')
    if (raw !== lastRaw) {
      lastRaw = raw
      snapshot = decode(raw)
    }
  } catch {
    memoryOnly = true
    snapshot = { ...snapshot, storageAvailable: false }
  }
  return snapshot
}
function save(next: OrderState) {
  snapshot = next
  if (!memoryOnly) {
    try {
      const raw = JSON.stringify({
        version: 2,
        ownerId: next.ownerId,
        drafts: next.drafts,
        expandedRestaurantId: next.expandedRestaurantId,
        pending: next.pending,
      })
      sessionStorage.setItem(KEY, raw)
      sessionStorage.removeItem('ecobite.order-drafts.v1')
      lastRaw = raw
    } catch {
      try {
        sessionStorage.removeItem(KEY)
        sessionStorage.removeItem('ecobite.order-drafts.v1')
      } catch {
        /* The browser can block storage entirely. */
      }
      memoryOnly = true
      snapshot = { ...next, storageAvailable: false }
    }
  }
  listeners.forEach((listener) => listener())
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export const useOrders = () => useSyncExternalStore(subscribe, getOrders)
export function clearOrders() {
  save({ ...empty(), storageAvailable: !memoryOnly })
}
export function claimOrderOwner(ownerId: number) {
  const state = getOrders()
  if (state.ownerId !== ownerId)
    save({ ...(state.ownerId === null ? state : empty()), ownerId, storageAvailable: !memoryOnly })
}
export function editDraft(
  restaurantId: number,
  name: string,
  patch: Partial<Pick<OrderDraft, 'search' | 'category'>>,
) {
  const state = getOrders()
  const draft = state.drafts[restaurantId] ?? { restaurantId, name, items: {}, search: '', category: '' }
  save({ ...state, drafts: { ...state.drafts, [restaurantId]: { ...draft, name, ...patch } } })
}
export function toggleDraft(restaurantId: number) {
  const state = getOrders()
  save({ ...state, expandedRestaurantId: state.expandedRestaurantId === restaurantId ? null : restaurantId })
}
export function changeDraftQuantity(
  restaurantId: number,
  name: string,
  dishId: number,
  delta: number,
): boolean {
  const state = getOrders()
  if (state.pending) {
    save({
      ...state,
      message:
        'Hay una confirmación pendiente. Recuperá su resultado en el checkout antes de modificar el carrito.',
    })
    return false
  }
  if (!positive(restaurantId) || !positive(dishId) || !Number.isInteger(delta)) return false
  const draft = state.drafts[restaurantId] ?? { restaurantId, name, items: {}, search: '', category: '' }
  const items = { ...draft.items }
  const quantity = Math.max(0, (items[dishId] ?? 0) + delta)
  if (
    quantity > 20 ||
    (!items[dishId] && quantity > 0 && Object.keys(items).length >= 20) ||
    (!Object.keys(draft.items).length && quantity > 0 && cartDrafts(state).length >= 20)
  ) {
    save({
      ...state,
      message: 'Máximo 20 restaurantes, 20 platos distintos por restaurante y 20 unidades por plato.',
    })
    return false
  }
  if (quantity) items[dishId] = quantity
  else delete items[dishId]
  save({
    ...state,
    message: null,
    expandedRestaurantId: restaurantId,
    drafts: { ...state.drafts, [restaurantId]: { ...draft, name, items } },
  })
  return true
}
export function reconcileDraft(restaurantId: number, availableIds: number[]) {
  const state = getOrders()
  const draft = state.drafts[restaurantId]
  if (!draft || state.pending) return
  const available = new Set(availableIds)
  const items = Object.fromEntries(Object.entries(draft.items).filter(([id]) => available.has(Number(id))))
  if (Object.keys(items).length === Object.keys(draft.items).length) return
  save({
    ...state,
    message: 'Quitamos platos que ya no están disponibles. Revisá el carrito antes de continuar.',
    drafts: { ...state.drafts, [restaurantId]: { ...draft, items } },
  })
}
export function removeDraft(restaurantId: number) {
  const state = getOrders()
  if (state.pending) return
  const drafts = { ...state.drafts }
  delete drafts[restaurantId]
  save({ ...state, drafts })
}
export function beginConfirmation(expectedSubtotalCents: number): PendingConfirmation {
  const state = getOrders()
  if (state.pending) return state.pending
  const pending = { key: crypto.randomUUID(), orders: cartInputs(state), expectedSubtotalCents }
  save({ ...state, pending })
  return pending
}
export function releaseConfirmation() {
  const state = getOrders()
  save({ ...state, pending: null })
}
export function finishConfirmation() {
  const state = getOrders()
  const drafts = { ...state.drafts }
  for (const order of state.pending?.orders ?? []) delete drafts[order.restaurantId]
  save({ ...state, drafts, pending: null, message: null })
}
