import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { ROUTES, restaurantMenuUrl } from '@/shared/config/routes'
import { cartDrafts, changeDraftQuantity, removeDraft, toggleDraft, useOrders } from '@/shared/lib/orderDraft'
import { loadMenu, useMenus } from './menuCache'
import { formatPrice } from './formatPrice'
import './cart.css'

function useCartSummary() {
  const orders = useOrders()
  const groups = cartDrafts(orders)
  const menus = useMenus()
  const count = groups.reduce((sum, group) => sum + Object.values(group.items).reduce((a, b) => a + b, 0), 0)
  const complete = groups.every((group) => !!menus[group.restaurantId]?.data)
  const subtotal = groups.reduce(
    (sum, group) =>
      sum +
      (menus[group.restaurantId]?.data?.dishes ?? []).reduce(
        (total, dish) => total + dish.price * (group.items[dish.id] ?? 0),
        0,
      ),
    0,
  )
  return { orders, groups, menus, count, complete, subtotal }
}

function CartSummary({ idPrefix = 'cart' }: { idPrefix?: string }) {
  const { orders, groups, menus, count, complete, subtotal } = useCartSummary()
  const { usuario, loading } = useAuth()
  const navigate = useNavigate()
  const ids = groups.map((group) => group.restaurantId).join(',')
  useEffect(() => {
    for (const id of ids.split(',').filter(Boolean).map(Number)) void loadMenu(id).catch(() => {})
  }, [ids])
  return (
    <div className="cart-summary">
      <header className="cart-title">
        <ShoppingCart size={21} aria-hidden="true" />
        <h2>Tu carrito</h2>
        <span aria-hidden="true">{count}</span>
        <span className="sr-only" role="status">
          {count} productos en tu carrito
        </span>
      </header>
      <div className="cart-groups">
        {!groups.length && (
          <div className="cart-empty">
            <ShoppingCart size={36} aria-hidden="true" />
            <p>Tu carrito está vacío.</p>
            <small>Explorá los restaurantes y agregá tus platos favoritos.</small>
          </div>
        )}
        {orders.message && (
          <p role="status" className="cart-notice">
            {orders.message}
          </p>
        )}
        {!orders.storageAvailable && (
          <p role="status" className="cart-notice">
            No pudimos guardar el carrito en esta pestaña. No se conservará al recargar.
          </p>
        )}
        {groups.map((group) => {
          const entry = menus[group.restaurantId]
          const items = entry?.data?.dishes.filter((dish) => (group.items[dish.id] ?? 0) > 0) ?? []
          const quantity = Object.values(group.items).reduce((sum, n) => sum + n, 0)
          const amount = items.reduce((sum, dish) => sum + dish.price * (group.items[dish.id] ?? 0), 0)
          const expanded = groups.length === 1 || orders.expandedRestaurantId === group.restaurantId
          return (
            <section className="cart-group" key={group.restaurantId}>
              {groups.length > 1 ? (
                <button
                  type="button"
                  className="cart-group-toggle"
                  aria-expanded={expanded}
                  aria-controls={`${idPrefix}-items-${group.restaurantId}`}
                  onClick={() => toggleDraft(group.restaurantId)}
                >
                  <span>
                    <strong>{group.name}</strong>
                    <small>
                      {quantity} {quantity === 1 ? 'producto' : 'productos'} ·{' '}
                      {entry?.data ? formatPrice(amount) : 'Actualizando…'}
                    </small>
                  </span>
                  <ChevronDown size={18} aria-hidden="true" className={expanded ? 'is-expanded' : ''} />
                </button>
              ) : (
                <div className="cart-group-label">
                  <strong>{group.name}</strong>
                  <small>
                    {quantity} {quantity === 1 ? 'producto' : 'productos'}
                  </small>
                </div>
              )}
              <div id={`${idPrefix}-items-${group.restaurantId}`} hidden={!expanded}>
                {entry?.error && (
                  <div className="cart-notice">
                    <p role="alert">No pudimos actualizar este restaurante.</p>
                    <button
                      type="button"
                      onClick={() => void loadMenu(group.restaurantId, true).catch(() => {})}
                    >
                      Reintentar
                    </button>
                  </div>
                )}
                {!entry?.data && !entry?.error && <p role="status">Actualizando productos y precios…</p>}
                {items.map((dish) => (
                  <div className="cart-item" key={dish.id}>
                    <div className="cart-item-title">
                      <span>{dish.name}</span>
                      <strong>{formatPrice(dish.price * (group.items[dish.id] ?? 0))}</strong>
                    </div>
                    <div
                      className="quantity-picker"
                      role="group"
                      aria-label={`Cantidad de ${dish.name} en el carrito`}
                    >
                      <button
                        type="button"
                        disabled={!!orders.pending}
                        onClick={() => changeDraftQuantity(group.restaurantId, group.name, dish.id, -1)}
                        aria-label={`Quitar una unidad de ${dish.name}`}
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <span aria-live="polite">{group.items[dish.id] ?? 0}</span>
                      <button
                        type="button"
                        disabled={!!orders.pending || (group.items[dish.id] ?? 0) >= 20}
                        onClick={() => changeDraftQuantity(group.restaurantId, group.name, dish.id, 1)}
                        aria-label={`Agregar una unidad de ${dish.name}`}
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="cart-group-actions">
                  <Link to={restaurantMenuUrl(group.restaurantId)}>Ver menú</Link>
                  <button
                    type="button"
                    disabled={!!orders.pending}
                    onClick={() => removeDraft(group.restaurantId)}
                    aria-label={`Quitar restaurante ${group.name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Quitar
                  </button>
                </div>
              </div>
            </section>
          )
        })}
      </div>
      <footer className="cart-total">
        <p>
          <span>Subtotal de productos</span>
          <strong>{complete ? formatPrice(subtotal) : 'Actualizando…'}</strong>
        </p>
        <small>El envío no está calculado. Revisarás todo antes de confirmar.</small>
        <button
          type="button"
          className="eco-button"
          disabled={!count || loading || (!complete && !orders.pending)}
          onClick={() =>
            navigate(
              usuario ? ROUTES.checkout : ROUTES.login,
              usuario ? undefined : { state: { from: ROUTES.checkout } },
            )
          }
        >
          {orders.pending ? 'Recuperar confirmación' : 'Ir a pagar'}
        </button>
      </footer>
    </div>
  )
}

export function CartPanel({
  open,
  onOpen,
  onClose,
}: {
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const { count, complete, subtotal } = useCartSummary()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [open])
  return (
    <>
      <aside id="tu-pedido" tabIndex={-1} aria-label="Carrito" className="persistent-cart">
        <CartSummary />
      </aside>
      <div className="mobile-cart-bar">
        <span>
          <strong>
            {count} {count === 1 ? 'producto' : 'productos'}
          </strong>
          <small>{complete ? formatPrice(subtotal) : 'Actualizando…'}</small>
        </span>
        <button type="button" onClick={onOpen}>
          Ver carrito
        </button>
      </div>
      {open && (
        <dialog ref={dialog} className="cart-dialog" aria-label="Tu carrito" onClose={onClose}>
          <button
            type="button"
            className="cart-dialog-close"
            aria-label="Cerrar carrito"
            onClick={() => dialog.current?.close()}
          >
            <X size={22} aria-hidden="true" />
          </button>
          <CartSummary idPrefix="cart-dialog" />
        </dialog>
      )}
    </>
  )
}
