'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Calendar, Check } from 'lucide-react'
import { scrollToId } from '@/lib/scroll'

const HEADLINE = 'Grow the life you keep imagining.'

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-hero]', { opacity: 1, y: 0 })
        gsap.set('[data-char]', { opacity: 1, y: 0, rotate: 0 })
        gsap.set('[data-photo]', { clipPath: 'inset(0% 0 0 0)' })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(
        '[data-eyebrow]',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.6, delay: 0.1 },
      )
      tl.fromTo(
        '[data-char]',
        { y: 24, rotate: 4, opacity: 0 },
        { y: 0, rotate: 0, opacity: 1, duration: 0.7, stagger: 0.018 },
        0.25,
      )
      tl.fromTo(
        '[data-hero]',
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08 },
        0.5,
      )
      tl.fromTo(
        '[data-photo]',
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)', duration: 0.9 },
        0.35,
      )
      tl.fromTo(
        '[data-badge]',
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)' },
        1.05,
      )
      gsap.to('[data-photo]', {
        yPercent: -8,
        scrollTrigger: undefined,
        ease: 'none',
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={root}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px 480px at 85% 5%, #E7F4EC 0%, rgba(231,244,236,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: 'url(/texture-grain.png)', backgroundSize: '512px' }}
      />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-site flex-col justify-center gap-12 px-5 pb-24 pt-16 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        {/* Copy */}
        <div className="lg:w-[55%]">
          <p
            data-eyebrow
            className="flex items-center gap-2 font-script text-2xl text-fresh-green-600"
          >
            Hi, I'm Roja
            <img src="/leaf-line.svg" alt="" className="h-6 w-6" aria-hidden="true" />
          </p>
          <h1
            id="hero-heading"
            className="font-display-lg mt-4 font-display text-[40px] font-medium leading-[1.08] tracking-[-0.01em] text-deep-blue lg:text-[64px]"
            aria-label={HEADLINE}
          >
            {HEADLINE.split(' ').map((word, wi) => (
              <span key={wi} className="inline-block whitespace-nowrap" aria-hidden="true">
                {word.split('').map((ch, ci) => (
                  <span key={ci} data-char className="inline-block will-change-transform">
                    {ch}
                  </span>
                ))}
                {wi < HEADLINE.split(' ').length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <p data-hero className="mt-6 max-w-[46ch] text-[17px] leading-[1.65] text-text-body lg:text-lg">
            I help thoughtful people move past emotional exhaustion and self-doubt —
            using NLP, EFT, Ho'oponopono and deep belief work — so they can set
            boundaries, break old patterns, and feel like themselves again.
          </p>

          <div data-hero className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => scrollToId('book')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-fresh-green px-7 py-3.5 text-[15px] font-semibold tracking-[0.01em] text-white transition-all duration-200 hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.97]"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Book a Session
            </button>
            <button
              onClick={() => scrollToId('program')}
              className="inline-flex items-center justify-center rounded-full border-[1.5px] border-deep-blue px-7 py-3.5 text-[15px] font-semibold tracking-[0.01em] text-deep-blue transition-all duration-200 hover:bg-deep-blue hover:text-white active:scale-[0.97]"
            >
              Explore Reclaim Your Power
            </button>
          </div>

          <ul data-hero className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-text-body">
            {['Free 20-min discovery call', '100+ sessions held', 'Online via Zoom'].map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-grey-line" />}
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-fresh-green-600" aria-hidden="true" />
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Photo */}
        <div className="relative mx-auto w-full max-w-[380px] lg:w-[45%] lg:max-w-[440px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -rotate-2 translate-x-3 translate-y-4 rounded-[24px] bg-green-tint"
          />
          <div
            data-photo
            className="relative overflow-hidden shadow-card"
            style={{ borderRadius: '999px 999px 24px 24px' }}
          >
            <img
              src="/roja-hero.png"
              alt="Roja, smiling in a red dress on a boat with a city skyline behind her"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          <img
            src="/leaf-line.svg"
            alt=""
            aria-hidden="true"
            className="absolute -left-6 -top-6 h-16 w-16 -rotate-12 opacity-70"
          />
          <div
            data-badge
            className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card sm:-left-10"
          >
            <span className="rounded-full bg-[#C9A227]/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-warm-gold">
              Signature
            </span>
            <span className="text-[13px] font-medium leading-snug text-deep-blue">
              4-week signature journey —<br />
              <span className="font-display italic">Reclaim Your Power</span>
            </span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex" aria-hidden="true">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-body/70">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-grey-line">
          <span className="absolute inset-x-0 top-0 h-4 animate-[scrollcue_1.6s_ease-in-out_infinite] bg-fresh-green" />
        </span>
        <style>{`@keyframes scrollcue { 0%{transform:translateY(-100%)} 100%{transform:translateY(300%)} }`}</style>
      </div>
    </section>
  )
}
