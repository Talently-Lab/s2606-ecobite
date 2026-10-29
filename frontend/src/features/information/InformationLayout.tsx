import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { SiteHeader } from '@/shared/components/SiteHeader'
import { SiteFooter } from '@/shared/components/SiteFooter'
import './information.css'

export function InformationLayout({ title, children }: { title: string; children: ReactNode }) {
  const { hash } = useLocation()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${title} · EcoBite`
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations: Animation[] = []
    let observer: IntersectionObserver | undefined
    if (!media.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            animations.push(
              entry.target.animate(
                [
                  { opacity: 0, transform: 'translateY(20px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
                { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'none' },
              ),
            )
            observer?.unobserve(entry.target)
          })
        },
        { threshold: 0.12 },
      )
      root.current?.querySelectorAll('[data-reveal]').forEach((element) => observer?.observe(element))
    }
    const stopMotion = () => {
      if (media.matches) {
        observer?.disconnect()
        animations.forEach((animation) => animation.cancel())
      }
    }
    media.addEventListener('change', stopMotion)
    return () => {
      document.title = previousTitle
      observer?.disconnect()
      animations.forEach((animation) => animation.cancel())
      media.removeEventListener('change', stopMotion)
    }
  }, [title, hash])
  return (
    <div ref={root} className="info-page flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-lg focus:bg-white focus:p-4"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
export function PageHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div data-reveal>
      <span className="info-icon mb-5">
        <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-noche sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-musgo">{description}</p>
    </div>
  )
}
