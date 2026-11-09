import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { ROUTES, restaurantMenuUrl, checkoutUrl } from '@/shared/config/routes'
import { cartDrafts, changeDraftQuantity, removeDraft, useOrders } from '@/shared/lib/orderDraft'
import { loadMenu, useMenus } from './menuCache'
import { formatPrice } from './formatPrice'
import './cart.css'

function useCartSummary(restaurantId?: number) {
  const orders = useOrders()
  const groups = cartDrafts(orders).filter(
    (draft) => restaurantId === undefined || draft.restaurantId === restaurantId,
  )
  const menus = useMenus()
  const count = groups.reduce((sum, group) => sum + Object.values(group.items).reduce((a, b) => a + b, 0), 0)
  return { orders, groups, menus, count }
}

function CartSummary({ idPrefix = 'cart', restaurantId }: { idPrefix?: string; restaurantId?: number }) {
  const { orders, groups, menus, count } = useCartSummary(restaurantId)
  const { usuario, loading } = useAuth()
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const hasOtherCarts =
    restaurantId !== undefined && cartDrafts(orders).some((draft) => draft.restaurantId !== restaurantId)
  const restaurantName = restaurantId === undefined ? null : menus[restaurantId]?.data?.restaurant.name
  const ids = groups.map((group) => group.restaurantId).join(',')
  useEffect(() => {
    for (const id of ids.split(',').filter(Boolean).map(Number)) void loadMenu(id).catch(() => {})
  }, [ids])
  return (
    <div className="cart-summary">
      <header className="cart-title">
        <ShoppingCart size={21} aria-hidden="true" />
        <h2>
          {restaurantId === undefined
            ? 'Tus carritos'
            : `Tu pedido${restaurantName ? ` de ${restaurantName}` : ''}`}
        </h2>
        <span role="status">
          {count} {count === 1 ? 'producto' : 'productos'}
        </span>
      </header>
      <div className="cart-groups">
        {restaurantId === undefined && groups.length > 0 && (
          <p className="cart-explanation">Cada carrito se confirma y entrega por separado.</p>
        )}
        {!groups.length && (
          <div className="cart-empty">
            {restaurantId === undefined ? (
              <>
                <p>Tu carrito está vacío.</p>
                <small>Elegí un restaurante para empezar.</small>
              </>
            ) : (
              <p>Agregá un plato para empezar.</p>
            )}
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
          const expanded = restaurantId !== undefined || expandedId === group.restaurantId
          return (
            <section className="cart-group" key={group.restaurantId}>
              {restaurantId === undefined ? (
                <button
                  type="button"
                  className="cart-group-toggle"
                  aria-expanded={expanded}
                  aria-controls={`${idPrefix}-items-${group.restaurantId}`}
                  onClick={() => setExpandedId(expanded ? null : group.restaurantId)}
                  aria-label={`Revisar carrito de ${group.name}`}
                >
                  <span>
                    <strong>{group.name}</strong>
                    <small>
                      {quantity} {quantity === 1 ? 'producto' : 'productos'} · Subtotal:{' '}
                      {entry?.data ? formatPrice(amount) : 'Actualizando…'}
                    </small>
                  </span>
                  <ChevronDown size={18} aria-hidden="true" className={expanded ? 'is-expanded' : ''} />
                </button>
              ) : null}
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
              <div id={`${idPrefix}-items-${group.restaurantId}`} hidden={!expanded}>
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
                    aria-label={`Quitar carrito de ${group.name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Quitar carrito
                  </button>
                </div>
                <div className="cart-restaurant-total">
                  <p>
                    <span>Subtotal de productos</span>
                    <strong>{entry?.data ? formatPrice(amount) : 'Actualizando…'}</strong>
                  </p>
                  {!usuario && (
                    <p className="text-sm text-musgo">
                      Para confirmar tu pedido, iniciá sesión o creá una cuenta.
                    </p>
                  )}
                  <button
                    type="button"
                    className="eco-button"
                    disabled={loading || !entry?.data || !!entry.error || !!orders.pending}
                    aria-label={
                      usuario
                        ? `Revisar pedido de ${group.name}`
                        : `Iniciar sesión para continuar con ${group.name}`
                    }
                    onClick={() =>
                      navigate(
                        usuario ? checkoutUrl(group.restaurantId) : ROUTES.login,
                        usuario ? undefined : { state: { from: checkoutUrl(group.restaurantId) } },
                      )
                    }
                  >
                    {usuario ? 'Revisar pedido' : 'Iniciar sesión para continuar'}
                  </button>
                </div>
              </div>
            </section>
          )
        })}
      </div>
      {(orders.pending || hasOtherCarts) && (
        <footer className="cart-total">
          {hasOtherCarts && (
            <Link
              className="inline-flex min-h-11 items-center underline"
              to={`${ROUTES.restaurants}?carrito=1`}
            >
              Ver mis otros carritos
            </Link>
          )}
          {orders.pending && (
            <Link className="eco-button" to={checkoutUrl(orders.pending.orders[0]!.restaurantId)}>
              Revisar confirmación pendiente
            </Link>
          )}
        </footer>
      )}
    </div>
  )
}

export function CartPanel({
  open,
  onOpen,
  onClose,
  restaurantId,
}: {
  restaurantId?: number
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const { count, groups, orders } = useCartSummary(restaurantId)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [open])
  return (
    <>
      {restaurantId !== undefined && (
        <aside id="tu-pedido" tabIndex={-1} aria-label="Carrito" className="persistent-cart">
          <CartSummary restaurantId={restaurantId} />
        </aside>
      )}
      {(restaurantId === undefined ||
        count > 0 ||
        orders.message ||
        !orders.storageAvailable ||
        orders.pending) && (
        <div className={restaurantId === undefined ? 'catalog-cart-bar' : 'mobile-cart-bar'}>
          <span>
            <strong>
              {restaurantId === undefined &&
                `${groups.length} ${groups.length === 1 ? 'carrito' : 'carritos'} · `}
              {count} {count === 1 ? 'producto' : 'productos'}
            </strong>
            <small>
              {restaurantId === undefined
                ? 'Se confirman y entregan por separado'
                : (orders.message ??
                  (orders.pending
                    ? 'Hay una confirmación pendiente'
                    : !orders.storageAvailable
                      ? 'El carrito no se conservará al recargar'
                      : 'Carrito de este restaurante'))}
            </small>
          </span>
          <button type="button" onClick={onOpen}>
            {restaurantId === undefined ? 'Ver carritos' : 'Ver carrito'}
          </button>
        </div>
      )}
      {open && (
        <dialog
          ref={dialog}
          className="cart-dialog"
          aria-label={restaurantId === undefined ? 'Tus carritos' : 'Tu carrito'}
          onClose={onClose}
        >
          <button
            type="button"
            className="cart-dialog-close"
            aria-label="Cerrar carrito"
            onClick={() => dialog.current?.close()}
          >
            <X size={22} aria-hidden="true" />
          </button>
          <CartSummary idPrefix="cart-dialog" restaurantId={restaurantId} />
        </dialog>
      )}
    </>
  )
}
