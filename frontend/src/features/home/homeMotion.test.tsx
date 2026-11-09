import { fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import HomeMotion from './homeMotion'

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { name: 'ScrollTrigger', register() {}, refresh: vi.fn() },
}))
let fixture: HTMLDivElement
let transition: gsap.core.Timeline | undefined
let mode: 'desktop' | 'mobile' | 'reduce'

beforeEach(() => {
  mode = 'desktop'
  transition = undefined
  vi.stubGlobal('matchMedia', vi.fn())
  vi.stubGlobal('scrollTo', vi.fn())
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800)
  const timeline = gsap.timeline.bind(gsap)
  vi.spyOn(gsap, 'timeline').mockImplementation((options) => {
    const result = timeline({ ...options, scrollTrigger: undefined, paused: true })
    if (options?.scrollTrigger) {
      transition = result
      Object.defineProperty(result, 'scrollTrigger', { value: { end: 1200, revert: vi.fn(), kill: vi.fn() } })
    }
    return result
  })
  vi.spyOn(gsap, 'matchMedia').mockImplementation(() => {
    const contexts: gsap.Context[] = []
    return {
      add(query: string, callback: () => void | (() => void), scope: HTMLElement) {
        if (mode !== 'reduce' && !(mode === 'mobile' && query.includes('min-width')))
          contexts.push(gsap.context(callback, scope))
        return this
      },
      revert() {
        contexts.reverse().forEach((context) => context.revert())
      },
    } as unknown as gsap.MatchMedia
  })
  fixture = document.createElement('div')
  fixture.innerHTML =
    '<div class="home-discovery"><section class="home-hero"><div class="hero-copy hero-enter"><a href="#opciones" data-discover-link>Ver opciones</a></div><div class="hero-art"><img class="hero-bowl" alt="" /><span class="ingredient"></span><span class="hero-stamp"></span></div><span class="hero-art-label"></span></section><section class="home-featured" tabindex="-1"><a href="/restaurantes/1">Ver menú</a></section></div>'
  document.body.append(fixture)
})
afterEach(() => {
  fixture.remove()
  gsap.ticker.sleep()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Apertura del bowl hacia los platos', () => {
  it('revela los platos, permite volver al hero y restaura los estilos al salir', () => {
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    gsap.ticker.sleep()
    const featured = fixture.querySelector<HTMLElement>('.home-featured')!
    const hero = fixture.querySelector<HTMLElement>('.home-hero')!
    expect(fixture.firstElementChild).toHaveClass('is-animated')
    expect(featured.style.visibility).toBe('hidden')
    transition!.progress(1)
    expect(featured.style.clipPath).toBe('none')
    expect(Number(gsap.getProperty(featured, 'opacity'))).toBe(1)
    expect(hero.style.visibility).toBe('hidden')
    expect(fixture.querySelector('[inert]')).toBeNull()
    transition!.progress(0)
    expect(featured.style.visibility).toBe('hidden')
    expect(hero.style.visibility).not.toBe('hidden')
    expect(Number(gsap.getProperty(fixture.querySelector('.hero-art')!, 'scaleX'))).toBe(1)
    unmount()
    expect(fixture.firstElementChild).not.toHaveClass('is-animated')
    expect(featured.style.clipPath).toBe('')
    expect(hero.style.visibility).toBe('')
  })

  it('permite saltar la animación y completa la apertura al enfocar un menú', () => {
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    const featured = fixture.querySelector<HTMLElement>('.home-featured')!
    fireEvent.click(fixture.querySelector('[data-discover-link]')!)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: 'instant' })
    expect(featured).toHaveFocus()
    expect(featured.style.clipPath).toBe('none')
    transition!.progress(0.5)
    fireEvent.focusIn(featured.querySelector('a')!)
    expect(transition!.progress()).toBe(1)
    expect(featured.style.clipPath).toBe('none')
    unmount()
  })

  it.each(['mobile', 'reduce'] as const)('en modo %s deja las opciones en el flujo normal', (nextMode) => {
    mode = nextMode
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    expect(transition).toBeUndefined()
    expect(fixture.firstElementChild).not.toHaveClass('is-animated')
    expect(fixture.querySelector<HTMLElement>('.home-featured')!.style.visibility).toBe('')
    expect(fixture.querySelector('[inert]')).toBeNull()
    expect(fixture.querySelector('[data-discover-link]')).toHaveAttribute('href', '#opciones')
    unmount()
  })

  it('retira los listeners de las imágenes y cancela el refresco al desmontar', () => {
    mode = 'reduce'
    const schedule = vi.fn(() => 1)
    vi.stubGlobal('requestAnimationFrame', schedule)
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    const image = fixture.querySelector('img')!
    expect(schedule).toHaveBeenCalledTimes(1)
    fireEvent.load(image)
    expect(schedule).toHaveBeenCalledTimes(2)
    unmount()
    fireEvent.load(image)
    expect(schedule).toHaveBeenCalledTimes(2)
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1)
  })
})
