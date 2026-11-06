import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  sessionStorage.clear()
  vi.resetModules()
})
afterEach(() => vi.restoreAllMocks())

describe('carrito agrupado', () => {
  it('conserva varios restaurantes y filtros después de recargar, sin guardar precios', async () => {
    const first = await import('./orderDraft')
    first.changeDraftQuantity(1, 'Verde', 16, 2)
    first.changeDraftQuantity(2, 'Raíz', 20, 1)
    first.editDraft(1, 'Verde', { search: 'quinoa', category: 'Bowls' })
    vi.resetModules()
    const restored = await import('./orderDraft')
    expect(restored.getOrders().drafts[1]).toMatchObject({
      items: { 16: 2 },
      search: 'quinoa',
      category: 'Bowls',
    })
    expect(restored.getOrders().drafts[2]?.items).toEqual({ 20: 1 })
    expect(restored.cartInputs(restored.getOrders())).toHaveLength(2)
    expect(sessionStorage.getItem('ecobite.order-drafts.v2')).not.toMatch(/unitPrice|precio/)
  })
  it('migra todos los borradores anteriores sin mezclarlos y solicita revisión', async () => {
    sessionStorage.setItem(
      'ecobite.order-drafts.v1',
      JSON.stringify({
        version: 1,
        ownerId: null,
        activeRestaurantId: 1,
        drafts: {
          1: { restaurantId: 1, name: 'Verde', search: '', category: '', items: { 16: 2 } },
          2: { restaurantId: 2, name: 'Raíz', search: '', category: '', items: { 20: 1 } },
        },
      }),
    )
    const store = await import('./orderDraft')
    expect(store.cartDrafts(store.getOrders())).toHaveLength(2)
    expect(store.getOrders().message).toMatch(/Recuperamos/)
  })
  it('adopta el carrito visitante y limpia los datos de una cuenta distinta', async () => {
    const store = await import('./orderDraft')
    store.changeDraftQuantity(1, 'Verde', 16, 2)
    store.claimOrderOwner(1)
    store.claimOrderOwner(1)
    expect(store.getOrders().drafts[1]?.items[16]).toBe(2)
    store.claimOrderOwner(2)
    expect(store.getOrders().drafts).toEqual({})
    store.clearOrders()
    expect(store.getOrders().ownerId).toBeNull()
  })
  it('conserva el mismo intento tras recargar y bloquea cambios hasta recuperar su resultado', async () => {
    let store = await import('./orderDraft')
    store.changeDraftQuantity(1, 'Verde', 16, 2)
    const pending = store.beginConfirmation(900000)
    expect(store.beginConfirmation(1)).toBe(pending)
    expect(store.changeDraftQuantity(1, 'Verde', 16, 1)).toBe(false)
    vi.resetModules()
    store = await import('./orderDraft')
    expect(store.getOrders().pending).toEqual(pending)
    store.reconcileDraft(1, [])
    expect(store.getOrders().drafts[1]?.items).toEqual({ 16: 2 })
    store.finishConfirmation()
    expect(store.cartDrafts(store.getOrders())).toEqual([])
    expect(store.getOrders().pending).toBeNull()
  })
  it('retira productos no disponibles, permite quitar un grupo y limita cantidades', async () => {
    const store = await import('./orderDraft')
    store.changeDraftQuantity(1, 'Verde', 16, 20)
    expect(store.changeDraftQuantity(1, 'Verde', 16, 1)).toBe(false)
    store.changeDraftQuantity(1, 'Verde', 17, 1)
    store.reconcileDraft(1, [16])
    expect(store.getOrders().drafts[1]?.items).toEqual({ 16: 20 })
    expect(store.getOrders().message).toMatch(/ya no están disponibles/)
    store.removeDraft(1)
    expect(store.cartDrafts(store.getOrders())).toEqual([])
  })
  it('ignora JSON corrupto y cantidades inválidas', async () => {
    sessionStorage.setItem('ecobite.order-drafts.v2', '{broken')
    const store = await import('./orderDraft')
    expect(store.getOrders().drafts).toEqual({})
    sessionStorage.setItem(
      'ecobite.order-drafts.v2',
      JSON.stringify({
        version: 2,
        ownerId: null,
        drafts: {
          1: {
            restaurantId: 1,
            name: 'Verde',
            search: '',
            category: '',
            items: { 16: 2, 17: -1, 18: 21, 19: '2', bad: 2 },
          },
        },
      }),
    )
    expect(store.getOrders().drafts[1]?.items).toEqual({ 16: 2 })
  })
  it('mantiene el carrito en memoria si el almacenamiento falla', async () => {
    const store = await import('./orderDraft')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    store.changeDraftQuantity(1, 'Verde', 16, 2)
    expect(store.getOrders().storageAvailable).toBe(false)
    store.changeDraftQuantity(2, 'Raíz', 20, 1)
    expect(store.cartDrafts(store.getOrders())).toHaveLength(2)
  })
})
