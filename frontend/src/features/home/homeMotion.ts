import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function animateHome(scope: HTMLElement) {
  const media = gsap.matchMedia()
  media.add(
    '(prefers-reduced-motion: no-preference)',
    () => {
      gsap.from('.hero-enter', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        clearProps: 'all',
        ease: 'power2.out',
      })
      gsap.from('.hero-bowl', {
        rotation: -12,
        opacity: 0,
        duration: 1,
        clearProps: 'all',
        ease: 'power3.out',
      })
      gsap.from('.ingredient, .hero-stamp', {
        y: 12,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.25,
        clearProps: 'transform',
      })
    },
    scope,
  )

  media.add(
    '(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)',
    () => {
      const stage = scope.querySelector<HTMLElement>('.home-discovery')!
      const hero = scope.querySelector<HTMLElement>('.home-hero')!
      const art = scope.querySelector<HTMLElement>('.hero-art')!
      const featured = scope.querySelector<HTMLElement>('.home-featured')!
      const discover = scope.querySelector<HTMLAnchorElement>('[data-discover-link]')!
      stage.classList.add('is-animated')
      const closed = () => {
        const frame = stage.getBoundingClientRect()
        const bowl = art.getBoundingClientRect()
        return `circle(0px at ${bowl.left + bowl.width / 2 - frame.left}px ${bowl.top + bowl.height / 2 - frame.top}px)`
      }
      const opened = () =>
        `circle(${Math.hypot(stage.clientWidth, stage.clientHeight)}px at ${stage.clientWidth / 2}px ${stage.clientHeight / 2}px)`
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${stage.clientHeight}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      timeline
        .fromTo(
          '.hero-copy, .ingredient, .hero-stamp, .hero-art-label',
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.25, immediateRender: false },
          0,
        )
        .fromTo(art, { scale: 1 }, { scale: 4.5, duration: 0.8, immediateRender: false }, 0)
        .fromTo(
          featured,
          { autoAlpha: 0, clipPath: closed },
          { autoAlpha: 1, clipPath: opened, duration: 0.65 },
          0.15,
        )
        .set(hero, { autoAlpha: 0 }, 0.8)
        .set(featured, { clipPath: 'none' }, 0.8)
        .to({}, { duration: 0.2 })
      const finish = () => {
        window.scrollTo({ top: timeline.scrollTrigger!.end, behavior: 'instant' })
        timeline.progress(1)
      }
      const enter = (event: Event) => {
        event.preventDefault()
        finish()
        featured.focus({ preventScroll: true })
      }
      discover.addEventListener('click', enter)
      featured.addEventListener('focusin', finish)
      if (window.location.hash === '#opciones') enter(new Event('click'))
      return () => {
        discover.removeEventListener('click', enter)
        featured.removeEventListener('focusin', finish)
        stage.classList.remove('is-animated')
      }
    },
    scope,
  )

  let disposed = false
  let refreshFrame = 0
  const refresh = () => {
    if (disposed) return
    cancelAnimationFrame(refreshFrame)
    refreshFrame = requestAnimationFrame(() => {
      if (!disposed) ScrollTrigger.refresh()
    })
  }
  const images = Array.from(scope.querySelectorAll('.home-hero img'))
  images.forEach((image) => {
    image.addEventListener('load', refresh)
    image.addEventListener('error', refresh)
  })
  void document.fonts?.ready.then(refresh)
  refresh()
  return () => {
    disposed = true
    cancelAnimationFrame(refreshFrame)
    images.forEach((image) => {
      image.removeEventListener('load', refresh)
      image.removeEventListener('error', refresh)
    })
    media.revert()
  }
}

export default function HomeMotion({ scope }: { scope: RefObject<HTMLDivElement | null> }) {
  // A cached lazy child mounts before its parent's ref is assigned in the layout phase.
  useEffect(() => {
    if (scope.current && typeof window.matchMedia === 'function') return animateHome(scope.current)
  }, [scope])
  return null
}
