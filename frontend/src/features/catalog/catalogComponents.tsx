import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Leaf, Utensils, RotateCw } from 'lucide-react'
import { SiteHeader } from '@/shared/components/SiteHeader'
import { SiteFooter } from '@/shared/components/SiteFooter'
import { useLocation, useSearchParams } from 'react-router-dom'
import { CartPanel } from './CartPanel'
import { Button } from '@/shared/components/ui'

export function CatalogLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const browse = location.pathname.startsWith('/restaurantes')
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLElement | null>(null)
  const openCart = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null
    if (window.matchMedia?.('(max-width: 1023px)').matches) setOpen(true)
    else document.getElementById('tu-pedido')?.focus({ preventScroll: false })
  }, [])
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
  return (
    <div className={`flex min-h-screen flex-col ${browse ? 'catalog-with-cart' : ''}`}>
      <SiteHeader onCartOpen={browse ? openCart : undefined} />
      <main className={`catalog-main mx-auto w-full flex-1 ${browse ? 'cart-layout' : 'space-y-6'}`}>
        {browse ? (
          <>
            <div className="cart-browse-content space-y-6">{children}</div>
            <CartPanel open={open} onOpen={openCart} onClose={closeCart} />
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
