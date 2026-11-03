import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import HomeMotion from './homeMotion'

// Keep GSAP's real tween rendering. Only viewport events are replaced in jsdom.
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { name: 'ScrollTrigger', register() {}, refresh: vi.fn() },
}))
let fixture: HTMLDivElement
let scroll: gsap.core.Timeline
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn())
  const timeline = gsap.timeline.bind(gsap)
  vi.spyOn(gsap, 'timeline').mockImplementation((options) => {
    const animation = timeline({ ...options, scrollTrigger: undefined, paused: true })
    if (options?.scrollTrigger) scroll = animation
    return animation
  })
  vi.spyOn(gsap, 'matchMedia').mockImplementation(() => {
    const contexts: gsap.Context[] = []
    const media = {
      add(query: string, callback: () => void, scope: HTMLElement) {
        if (!query.includes('max-width')) contexts.push(gsap.context(callback, scope))
        return media
      },
      revert() {
        contexts.reverse().forEach((context) => context.revert())
      },
    }
    return media as unknown as gsap.MatchMedia
  })
  fixture = document.createElement('div')
  fixture.innerHTML =
    '<div class="home-portal" tabindex="-1"><section class="home-hero"><div class="hero-copy" style="opacity:1"><p class="hero-enter">Restaurantes</p><a data-map-link href="#mapa">Mapa</a></div><div class="hero-art"><img class="hero-bowl" alt="" /><img class="ingredient ingredient-leaf" style="opacity:1" alt="" /><img class="ingredient ingredient-tomato" style="opacity:1" alt="" /><img class="ingredient ingredient-avocado" style="opacity:1" alt="" /><span class="hero-stamp" style="opacity:1">Sabor</span><span class="hero-art-label" style="opacity:1">Ecobite</span></div></section><section class="portal-map" tabindex="-1"></section></div>'
  document.body.append(fixture)
})
afterEach(() => {
  fixture.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Restauración visual al volver del mapa', () => {
  it('recupera todas las imágenes al invertir el scroll, incluso si se inició durante la entrada', () => {
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    gsap.ticker.sleep()
    const decorations = Array.from(fixture.querySelectorAll<HTMLElement>('.ingredient, .hero-stamp'))
    const entrance = gsap.getTweensOf(decorations).filter((tween) => tween.parent !== scroll)
    entrance.forEach((tween) => tween.progress(0.3))
    scroll.progress(0.3)
    entrance.forEach((tween) => tween.progress(1))
    for (let cycle = 0; cycle < 3; cycle++) {
      scroll.progress(1)
      for (const element of decorations) expect(Number(gsap.getProperty(element, 'opacity'))).toBe(0)
      scroll.progress(0)
      for (const element of decorations) expect(Number(gsap.getProperty(element, 'opacity'))).toBe(1)
    }
    unmount()
  })
  it('restaura la opacidad y la escala tras recalcular en medio de la transición', () => {
    const { unmount } = render(<HomeMotion scope={{ current: fixture }} />)
    gsap.ticker.sleep()
    const decorations = Array.from(fixture.querySelectorAll<HTMLElement>('.ingredient, .hero-stamp'))
    const entrance = gsap.getTweensOf(decorations).filter((tween) => tween.parent !== scroll)
    entrance.forEach((tween) => tween.progress(0.3))
    scroll.progress(0.5)
    entrance.forEach((tween) => tween.progress(1))
    scroll.revert({ kill: false }).invalidate()
    scroll.progress(1).progress(0)
    for (const element of fixture.querySelectorAll('.hero-copy, .ingredient, .hero-stamp, .hero-art-label')) {
      expect(Number(gsap.getProperty(element, 'opacity'))).toBe(1)
    }
    expect(Number(gsap.getProperty(fixture.querySelector('.hero-art'), 'scale'))).toBe(1)
    unmount()
  })
})
