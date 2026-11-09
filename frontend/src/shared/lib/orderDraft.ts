import { useSyncExternalStore } from 'react'

export interface DeliveryDestination {
  latitude: number
  longitude: number
  label: string
}
export function isDestination(value: unknown): value is DeliveryDestination {
  const p = value as DeliveryDestination | null
  return (
    !!p &&
    typeof p.latitude === 'number' &&
    Number.isFinite(p.latitude) &&
    Math.abs(p.latitude) <= 90 &&
    typeof p.longitude === 'number' &&
    Number.isFinite(p.longitude) &&
    Math.abs(p.longitude) <= 180 &&
    typeof p.label === 'string' &&
    !!p.label.trim() &&
    p.label.length <= 500
  )
}
const KEY = 'ecobite.order-drafts.v2'
export interface OrderInput {
  restaurantId: number
  zone?: string
  destination?: DeliveryDestination | null
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
  destination: DeliveryDestination | null
  ownerId: number | null
  drafts: Record<number, OrderDraft>
  pending: PendingConfirmation | null
  storageAvailable: boolean
  message: string | null
}
const empty = (): OrderState => ({
  destination: null,
  ownerId: null,
  drafts: {},
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
      destination: state.destination,
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
      destination: isDestination(value.destination) ? value.destination : null,
      drafts,
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
      Array.isArray(pending.orders) &&
      pending.orders.length > 0 &&
      pending.orders.every((order: OrderInput) => order && positive(order.restaurantId)) &&
      new Set(pending.orders.map((order: OrderInput) => order.restaurantId)).size === pending.orders.length &&
      pending.orders.every(
        (order: OrderInput) =>
          Array.isArray(order.items) &&
          order.items.length > 0 &&
          order.items.every(
            (item) => positive(item?.dishId) && positive(item?.quantity) && item.quantity <= 20,
          ),
      )
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
        destination: next.destination,
        drafts: next.drafts,
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
      message: 'Hay una confirmación pendiente. Revisá su estado antes de modificar el carrito.',
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
export function beginConfirmation(restaurantId: number, expectedSubtotalCents: number): PendingConfirmation {
  const state = getOrders()
  if (state.pending) return state.pending
  const order = cartInputs(state).find((candidate) => candidate.restaurantId === restaurantId)
  if (!order) throw new Error('El carrito de este restaurante está vacío.')
  const pending = { key: crypto.randomUUID(), orders: [order], expectedSubtotalCents }
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

export function setOrderDestination(destination: DeliveryDestination | null) {
  const state = getOrders()
  if (state.pending || (destination !== null && !isDestination(destination))) return
  save({ ...state, destination })
}
