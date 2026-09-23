import Lenis from 'lenis'

let lenis: Lenis | null = null

export function initLenis(): Lenis {
  if (lenis) return lenis
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lenis = new Lenis({ lerp: reduced ? 1 : 0.1, smoothWheel: !reduced })
  function raf(time: number) {
    lenis?.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  return lenis
}

export function scrollToId(id: string) {
  const el = document.getElementById(id.replace(/^#/, ''))
  if (!el) return
  if (lenis) {
    lenis.scrollTo(el, { offset: -72 })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
