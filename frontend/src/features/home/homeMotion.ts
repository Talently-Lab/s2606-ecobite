import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function animateHome(scope: HTMLElement) {
  const media = gsap.matchMedia()
  const stage = scope.querySelector<HTMLElement>('.home-portal')!
  const hero = scope.querySelector<HTMLElement>('.home-hero')!
  const map = scope.querySelector<HTMLElement>('.portal-map')!
  const skip = scope.querySelector<HTMLAnchorElement>('[data-map-link]')!
  const art = scope.querySelector<HTMLElement>('.hero-art')!
  const setAvailable = (ready: boolean) => {
    if (!ready && map.contains(document.activeElement)) stage.focus({ preventScroll: true })
    map.inert = !ready
    map.setAttribute('aria-hidden', String(!ready))
    hero.inert = ready
    hero.setAttribute('aria-hidden', String(ready))
  }
  const restore = () => {
    stage.classList.remove('portal-is-pinned')
    map.inert = false
    hero.inert = false
    map.removeAttribute('aria-hidden')
    hero.removeAttribute('aria-hidden')
  }

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
      // Entry owns translation; scroll alone owns these elements' opacity.
      gsap.from('.ingredient, .hero-stamp', {
        y: 12,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.25,
        clearProps: 'transform',
      })
      scope.querySelectorAll('.section-heading, .step-card').forEach((element) => {
        gsap.from(element, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          clearProps: 'all',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true },
        })
      })
    },
    scope,
  )

  media.add(
    '(min-width: 768px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)',
    () => {
      // Both scenes stay in normal flow until animation code has loaded successfully.
      stage.classList.add('portal-is-pinned')
      const origin = () => {
        const frame = stage.getBoundingClientRect()
        const bowl = art.getBoundingClientRect()
        return { x: bowl.left + bowl.width / 2 - frame.left, y: bowl.top + bowl.height / 2 - frame.top }
      }
      const closed = () => {
        const { x, y } = origin()
        return `circle(0px at ${x}px ${y}px)`
      }
      const opened = () =>
        `circle(${Math.hypot(stage.clientWidth, stage.clientHeight)}px at ${stage.clientWidth / 2}px ${stage.clientHeight / 2}px)`
      setAvailable(false)
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${stage.clientHeight * 1.2}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setAvailable(self.progress >= 0.95),
          onRefresh: (self) => setAvailable(self.progress >= 0.95),
        },
      })
      timeline
        .fromTo(
          '.hero-copy, .ingredient, .hero-stamp, .hero-art-label',
          { opacity: 1 },
          { opacity: 0, duration: 0.25, immediateRender: false },
          0,
        )
        .fromTo(art, { scale: 1 }, { scale: 4.5, duration: 0.85, immediateRender: false }, 0)
        .fromTo(map, { clipPath: closed }, { clipPath: opened, duration: 0.75 }, 0.15)
        .set(map, { clipPath: 'none' }, 0.95)
        .to({}, { duration: 0.05 })
      const enter = (event: Event) => {
        event.preventDefault()
        const trigger = timeline.scrollTrigger!
        window.scrollTo({ top: trigger.end, behavior: 'instant' })
        timeline.progress(1)
        setAvailable(true)
        map.focus({ preventScroll: true })
      }
      skip.addEventListener('click', enter)
      // Browser history or a shared anchor can open directly on the map.
      if (window.location.hash === '#mapa') enter(new Event('click'))
      return () => {
        skip.removeEventListener('click', enter)
        restore()
      }
    },
    scope,
  )

  media.add(
    '(max-width: 767px) and (prefers-reduced-motion: no-preference), (max-height: 600px) and (prefers-reduced-motion: no-preference)',
    () => {
      const reveal = gsap.fromTo(
        map,
        { clipPath: 'circle(0% at 50% 35%)' },
        {
          clipPath: 'circle(150% at 50% 35%)',
          duration: 0.45,
          ease: 'power2.out',
          clearProps: 'clipPath',
          scrollTrigger: { trigger: map, start: 'top 85%', once: true },
          onStart: () => {
            map.inert = true
          },
          onComplete: () => {
            map.inert = false
          },
        },
      )
      // Keyboard access must never wait for the reveal animation.
      const enter = (event: Event) => {
        event.preventDefault()
        reveal.progress(1)
        map.inert = false
        map.scrollIntoView({ behavior: 'smooth', block: 'start' })
        map.focus({ preventScroll: true })
      }
      const focus = () => {
        reveal.progress(1)
        map.inert = false
      }
      skip.addEventListener('click', enter)
      map.addEventListener('focusin', focus)
      return () => {
        skip.removeEventListener('click', enter)
        map.removeEventListener('focusin', focus)
        restore()
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
    restore()
  }
}

export default function HomeMotion({ scope }: { scope: RefObject<HTMLDivElement | null> }) {
  // A cached lazy child mounts before its parent's ref is assigned in the layout phase.
  useEffect(() => {
    if (scope.current && typeof window.matchMedia === 'function') return animateHome(scope.current)
  }, [scope])
  return null
}
