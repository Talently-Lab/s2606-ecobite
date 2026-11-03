import { StrictMode, useRef } from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeMotion from './homeMotion'

// Exercise the accessibility lifecycle independently of GSAP's rendering engine.
const motion = vi.hoisted(() => ({
  mode: 'desktop',
  callbacks: [] as (() => void)[],
  onUpdate: undefined as undefined | ((trigger: { progress: number }) => void),
  timeline: vi.fn(),
  progress: vi.fn(),
}))
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }))
vi.mock('gsap', () => {
  const chain = {
    to: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    progress: motion.progress,
    scrollTrigger: { end: 1200 },
  }
  chain.to.mockReturnValue(chain)
  chain.fromTo.mockReturnValue(chain)
  chain.set.mockReturnValue(chain)
  motion.timeline.mockImplementation((options) => {
    motion.onUpdate = options.scrollTrigger.onUpdate
    return chain
  })
  return {
    default: {
      registerPlugin: vi.fn(),
      from: vi.fn(),
      fromTo: vi.fn(() => ({ progress: motion.progress })),
      timeline: motion.timeline,
      matchMedia: () => ({
        add: (query: string, callback: () => void | (() => void)) => {
          if (motion.mode === 'reduce') return
          if (
            (query.includes('min-width') && motion.mode === 'mobile') ||
            (query.includes('max-width') && motion.mode === 'desktop')
          )
            return
          const cleanup = callback()
          if (cleanup) motion.callbacks.push(cleanup)
        },
        revert: () => {
          motion.callbacks.forEach((callback) => callback())
          motion.callbacks = []
        },
      }),
    },
  }
})
let fixture: HTMLDivElement
beforeEach(() => {
  motion.mode = 'desktop'
  motion.callbacks = []
  motion.onUpdate = undefined
  motion.timeline.mockClear()
  motion.progress.mockClear()
  vi.stubGlobal('matchMedia', vi.fn())
  vi.stubGlobal('scrollTo', vi.fn())
  fixture = document.createElement('div')
  fixture.innerHTML =
    '<div class="home-portal" tabindex="-1"><section class="home-hero"><div class="hero-art"></div><a data-map-link href="#mapa">Explorar el mapa</a></section><section id="mapa" class="portal-map" tabindex="-1"><button>Un restaurante</button></section></div>'
  document.body.append(fixture)
})
afterEach(() => {
  fixture.remove()
  vi.unstubAllGlobals()
})

describe('Acceso al mapa durante la transición', () => {
  it('inicializa la animación al volver a montar la portada con el módulo ya cargado', () => {
    function Page() {
      const scope = useRef<HTMLDivElement>(null)
      return (
        <div ref={scope}>
          <HomeMotion scope={scope} />
          <div className="home-portal" tabIndex={-1}>
            <section className="home-hero">
              <div className="hero-art" />
              <a data-map-link href="#mapa">
                Mapa
              </a>
            </section>
            <section className="portal-map" tabIndex={-1} />
          </div>
        </div>
      )
    }
    const first = render(<Page />)
    expect(motion.timeline).toHaveBeenCalledTimes(1)
    first.unmount()
    render(
      <StrictMode>
        <Page />
      </StrictMode>,
    )
    expect(motion.timeline).toHaveBeenCalledTimes(3)
  })

  it('permite saltar al mapa, revierte al subir y restaura el contenido al desmontar', () => {
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    const map = fixture.querySelector<HTMLElement>('#mapa')!
    const hero = fixture.querySelector<HTMLElement>('.home-hero')!
    const stage = fixture.querySelector<HTMLElement>('.home-portal')!
    expect(map.inert).toBe(true)
    expect(map).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(fixture.querySelector('a')!)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: 'instant' })
    expect(map.inert).toBe(false)
    expect(hero.inert).toBe(true)
    expect(map).toHaveFocus()
    act(() => motion.onUpdate?.({ progress: 0.4 }))
    expect(map.inert).toBe(true)
    expect(stage).toHaveFocus()
    unmount()
    expect(map.inert).toBe(false)
    expect(hero.inert).toBe(false)
    expect(map).not.toHaveAttribute('aria-hidden')
    expect(stage).not.toHaveClass('portal-is-pinned')
  })

  it('recalcula al cargar imágenes del hero y retira los listeners al salir, sin observar tiles del mapa', () => {
    const schedule = vi.fn(() => 1)
    vi.stubGlobal('requestAnimationFrame', schedule)
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    const image = document.createElement('img')
    const tile = document.createElement('img')
    fixture.querySelector('.home-hero')!.append(image)
    fixture.querySelector('#mapa')!.append(tile)
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    expect(schedule).toHaveBeenCalledTimes(1)
    fireEvent.load(image)
    expect(schedule).toHaveBeenCalledTimes(2)
    fireEvent.load(tile)
    expect(schedule).toHaveBeenCalledTimes(2)
    unmount()
    fireEvent.load(image)
    expect(schedule).toHaveBeenCalledTimes(2)
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1)
  })

  it('con movimiento reducido conserva ambas escenas accesibles y sin fijación', () => {
    motion.mode = 'reduce'
    render(<HomeMotion scope={{ current: fixture }} />)
    expect(motion.timeline).not.toHaveBeenCalled()
    expect(fixture.querySelector('.home-portal')).not.toHaveClass('portal-is-pinned')
    expect(fixture.querySelector('#mapa')).not.toHaveAttribute('aria-hidden')
    expect(fixture.querySelector('.home-hero')).not.toHaveAttribute('aria-hidden')
  })
  it('en móvil permite saltar la revelación sin fijar el scroll', () => {
    motion.mode = 'mobile'
    const map = fixture.querySelector<HTMLElement>('#mapa')!
    map.scrollIntoView = vi.fn()
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    fireEvent.click(fixture.querySelector('a')!)
    expect(motion.timeline).not.toHaveBeenCalled()
    expect(motion.progress).toHaveBeenCalledWith(1)
    expect(map.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(map.inert).toBe(false)
    expect(map).toHaveFocus()
    unmount()
  })
})
