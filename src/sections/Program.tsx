'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Anchor, ArrowRight, Eye, Sparkles, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { scrollToId } from '@/lib/scroll'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Stage {
  week: string
  title: string
  copy: string
  icon: LucideIcon
}

const STAGES: Stage[] = [
  {
    week: 'Week 1',
    title: 'See',
    icon: Eye,
    copy: "Map your patterns with total honesty and zero judgment. You can't change what you can't see — this week, you finally see it.",
  },
  {
    week: 'Week 2',
    title: 'Release',
    icon: Wind,
    copy: "EFT and Ho'oponopono sessions to let go of the emotional weight keeping the old pattern in place.",
  },
  {
    week: 'Week 3',
    title: 'Rewire',
    icon: Sparkles,
    copy: 'NLP and belief work to install new responses — new self-talk, new boundaries, new defaults.',
  },
  {
    week: 'Week 4',
    title: 'Anchor',
    icon: Anchor,
    copy: 'Lock it in. Rituals, relapse plans, and a personal practice you keep for life.',
  },
]

const CHIPS = [
  '4× 60-min 1:1 sessions',
  'Weekly voice-note support',
  'Personal tapping library',
  'Anchor ritual workbook',
]

function PanelContent({ stage }: { stage: Stage }) {
  const Icon = stage.icon
  return (
    <div className="panel-inner max-w-md text-center lg:text-left">
      <span className="panel-item inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-green-tint">
        {stage.week}
      </span>
      <span className="panel-item mt-5 flex justify-center lg:justify-start">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fresh-green/20">
          <Icon className="h-7 w-7 text-fresh-green" aria-hidden="true" strokeWidth={1.75} />
        </span>
      </span>
      <h3 className="panel-item mt-4 font-display text-4xl font-medium text-white lg:text-5xl">
        {stage.title}
      </h3>
      <p className="panel-item mt-4 text-[16px] leading-[1.65] text-white/75">{stage.copy}</p>
    </div>
  )
}

export default function Program() {
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Simple fades for reduced motion users; no pin, no scrub.
      if (reduced) {
        gsap.utils.toArray<HTMLElement>('.prog-fade').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.6,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          )
        })
        return
      }

      // Entrance: white overlay crossfades out as deep-blue arrives (scrub)
      gsap.to('.prog-wash', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'top 55%',
          scrub: true,
        },
      })

      // Badge spring-pop + header reveal (once)
      gsap.fromTo(
        '.prog-badge',
        { scale: 0.6, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(2.2)',
          scrollTrigger: { trigger: '.prog-badge', start: 'top 80%', once: true },
        },
      )
      gsap.fromTo(
        '.prog-head-item',
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.prog-head', start: 'top 75%', once: true },
        },
      )

      // Chips + price + CTA entrance (once)
      gsap.fromTo(
        '.prog-chip',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.prog-chips', start: 'top 88%', once: true },
        },
      )
      gsap.fromTo(
        ctaRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 90%', once: true },
          onComplete: () => {
            gsap.fromTo(
              ctaRef.current,
              { boxShadow: '0 0 0 rgba(63,164,106,0)' },
              {
                boxShadow: '0 12px 40px rgba(63,164,106,.45)',
                duration: 0.6,
                yoyo: true,
                repeat: 1,
              },
            )
          },
        },
      )

      const mm = gsap.matchMedia()

      // Desktop: pinned horizontal scroll story
      mm.add('(min-width: 1024px)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('.prog-panel')
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top 15%',
            end: '+=160%',
            pin: true,
            scrub: 0.6,
            snap: 1 / 3,
            onUpdate: (self) =>
              setActive(Math.min(3, Math.round(self.progress * 3))),
          },
        })
        tl.to(trackRef.current, { xPercent: -75, ease: 'none', duration: 3 }, 0)
        tl.fromTo(fillRef.current, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 3 }, 0)
        tl.fromTo(
          dotRef.current,
          { x: 0 },
          { x: () => (barRef.current ? barRef.current.offsetWidth : 0), ease: 'none', duration: 3 },
          0,
        )
        panels.forEach((p, i) => {
          tl.fromTo(
            p.querySelectorAll('.panel-item'),
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' },
            i === 0 ? 0 : i - 0.35,
          )
        })
      })

      // Mobile: pinned stacked cards that crossfade with scroll
      mm.add('(max-width: 1023px)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('.prog-panel')
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 40 })
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top 20%',
            end: '+=160%',
            pin: true,
            scrub: 0.6,
            onUpdate: (self) =>
              setActive(Math.min(3, Math.round(self.progress * 3))),
          },
        })
        for (let i = 1; i < panels.length; i++) {
          tl.to(panels[i - 1], { autoAlpha: 0, y: -30, duration: 0.5 }, i)
          tl.to(panels[i], { autoAlpha: 1, y: 0, duration: 0.5 }, i + 0.15)
        }
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="program"
      ref={sectionRef}
      aria-labelledby="program-heading"
      className="relative overflow-hidden bg-deep-blue text-white"
    >
      {/* white wash that crossfades away on entrance */}
      <div className="prog-wash pointer-events-none absolute inset-0 z-30 bg-white" aria-hidden="true" />
      {/* grain texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'url(/texture-grain.png)', backgroundSize: '512px 512px' }}
      />
      {/* radial green glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(63,164,106,0.22) 0%, transparent 65%)' }}
      />
      {/* leaf watermark */}
      <img
        src="/leaf-line.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-1/2 h-[420px] w-[420px] -translate-y-1/2 opacity-[0.08]"
      />

      <div className="relative mx-auto max-w-site px-5 py-[72px] lg:px-10 lg:py-[120px]">
        {/* Header */}
        <div className="prog-head text-center">
          <span className="prog-badge prog-fade inline-block rounded-full bg-warm-gold/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-warm-gold">
            Signature Program
          </span>
          <h2
            id="program-heading"
            className="prog-head-item prog-fade font-display-lg mt-5 font-display text-[32px] font-medium leading-[1.12] text-white lg:text-5xl"
          >
            Reclaim Your Power
          </h2>
          <p className="prog-head-item prog-fade mt-3 font-script text-2xl text-green-tint lg:text-[32px]">
            a 4-week guided journey back to yourself
          </p>
        </div>

        {/* Pinned journey */}
        <div ref={pinRef} className="relative mt-14 lg:mt-20">
          {/* progress vine (desktop) */}
          <div
            ref={barRef}
            className="relative mx-auto mb-10 hidden h-[2px] max-w-3xl bg-white/15 lg:block"
          >
            <div
              ref={fillRef}
              className="absolute inset-y-0 left-0 w-full origin-left bg-fresh-green"
              style={{ transform: 'scaleX(0)' }}
            />
            <span
              ref={dotRef}
              className="absolute -left-1 -top-[5px] h-3 w-3 rounded-full bg-fresh-green shadow-[0_0_12px_rgba(63,164,106,0.9)]"
            />
            {STAGES.map((s, i) => (
              <span
                key={s.title}
                className={cn(
                  'absolute -top-[3px] h-2 w-2 -translate-x-1/2 rounded-full transition-colors duration-300',
                  i <= active ? 'bg-fresh-green' : 'bg-white/25',
                )}
                style={{ left: `${(i / 3) * 100}%` }}
              />
            ))}
          </div>

          {/* progress dots (mobile, left edge) */}
          <div className="absolute -left-1 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3 lg:hidden">
            {STAGES.map((s, i) => (
              <span
                key={s.title}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300',
                  i === active ? 'scale-125 bg-fresh-green' : 'bg-white/25',
                )}
              />
            ))}
          </div>

          {/* panels */}
          <div className={cn(reduced ? '' : 'relative h-[440px] overflow-hidden lg:h-[420px]')}>
            <div
              ref={trackRef}
              className={cn(
                reduced ? 'flex flex-col gap-10' : 'relative h-full lg:flex lg:w-[400%]',
              )}
            >
              {STAGES.map((s) => (
                <div
                  key={s.title}
                  className={cn(
                    'prog-panel prog-fade flex items-center justify-center',
                    reduced
                      ? 'rounded-[20px] border border-white/10 bg-white/5 px-6 py-10'
                      : 'absolute inset-0 px-6 lg:relative lg:inset-auto lg:w-full lg:shrink-0',
                  )}
                >
                  <PanelContent stage={s} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inclusions */}
        <div className="prog-chips mt-14 flex flex-wrap justify-center gap-2.5 lg:mt-16">
          {CHIPS.map((c) => (
            <span
              key={c}
              className="prog-chip prog-fade rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/85 backdrop-blur-sm"
            >
              {c}
            </span>
          ))}
        </div>

        <p className="prog-fade mt-6 text-center text-sm text-green-tint/90">
          Investment shared on your discovery call — payment plans available.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-5">
          <button
            ref={ctaRef}
            onClick={() => scrollToId('book')}
            className="rounded-full bg-fresh-green px-8 py-4 text-[15px] font-semibold tracking-[0.01em] text-white transition-colors duration-200 hover:bg-fresh-green-600 active:scale-[0.97]"
          >
            Explore Reclaim Your Power
          </button>
          <button
            onClick={() => scrollToId('book')}
            className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-green-tint"
          >
            <span className="relative">
              Or start with a free discovery call
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-green-tint transition-all duration-200 group-hover:w-full" />
            </span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  )
}
