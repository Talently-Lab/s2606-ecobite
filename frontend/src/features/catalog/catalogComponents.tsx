import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Leaf, Utensils, RotateCw } from 'lucide-react'
import { SiteHeader } from '@/shared/components/SiteHeader'
import { SiteFooter } from '@/shared/components/SiteFooter'
import { useLocation, useSearchParams, useParams } from 'react-router-dom'
import { CartPanel } from './CartPanel'
import { Button } from '@/shared/components/ui'
import { ROUTES } from '@/shared/config/routes'

export function CatalogLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const browse = location.pathname.startsWith('/restaurantes')
  const restaurantId =
    browse && id && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id)) ? Number(id) : undefined
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLElement | null>(null)
  const openCart = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null
    if (restaurantId === undefined || window.matchMedia?.('(max-width: 1023px)').matches) setOpen(true)
    else document.getElementById('tu-pedido')?.focus({ preventScroll: false })
  }, [restaurantId])
  const closeCart = () => {
    setOpen(false)
    if (opener.current?.isConnected) opener.current.focus()
    else document.querySelector<HTMLButtonElement>('.header-cart')?.focus()
  }
  useEffect(() => {
    if (!browse || params.get('carrito') !== '1') return
    const frame = requestAnimationFrame(() => {
      openCart()
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          next.delete('carrito')
          return next
        },
        { replace: true },
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [browse, params, setParams, openCart])
  const cartPanel = (
    <CartPanel open={open} onOpen={openCart} onClose={closeCart} restaurantId={restaurantId} />
  )
  return (
    <div
      className={`flex min-h-screen flex-col ${browse ? 'catalog-with-cart' : ''} ${browse && restaurantId === undefined ? 'restaurant-catalog' : ''}`}
    >
      <SiteHeader onCartOpen={browse ? openCart : undefined} restaurantId={restaurantId} />
      <main
        className={`catalog-main mx-auto w-full flex-1 ${browse ? 'cart-layout' : location.pathname === ROUTES.checkout ? 'checkout-main' : 'space-y-6'}`}
      >
        {browse ? (
          <>
            {restaurantId === undefined && cartPanel}
            <div className="cart-browse-content space-y-6">{children}</div>
            {restaurantId !== undefined && cartPanel}
          </>
        ) : (
          children
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

export function FoodImage({ src, alt }: { src: string | null; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  return (
    <div className="food-image">
      {src && src !== failedSrc ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width="640"
          height="420"
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="food-placeholder">
          <Utensils aria-label="Sin fotografía disponible" className="size-10" />
          <span>BUENA COMIDA, POR DESCUBRIR</span>
        </div>
      )}
    </div>
  )
}

export function LoadingState({ text = 'Cargando…' }: { text?: string }) {
  return (
    <p role="status" className="flex items-center gap-2 py-8 text-musgo">
      <Leaf className="size-5 animate-pulse" aria-hidden="true" />
      {text}
    </p>
  )
}
export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" onClick={onClick}>
      <RotateCw className="size-5" aria-hidden="true" /> Reintentar
    </Button>
  )
}
