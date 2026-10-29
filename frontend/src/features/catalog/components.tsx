import { useState, type ReactNode } from 'react'
import { Leaf, Utensils, RotateCw } from 'lucide-react'
import { SiteHeader } from '@/shared/components/SiteHeader'
import { SiteFooter } from '@/shared/components/SiteFooter'
import { Button } from '@/shared/components/ui'

export function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  )
}

export function FoodImage({ src, alt }: { src: string | null; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  return (
    <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-niebla">
      {src && src !== failedSrc ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        <Utensils aria-label="Sin fotografía disponible" className="size-10 text-bosque" />
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
