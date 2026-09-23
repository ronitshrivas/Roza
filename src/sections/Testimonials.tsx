'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const SPRING = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

const TESTIMONIALS = [
  {
    img: '/testimonial-1.jpg',
    quote:
      "I came in exhausted and cynical. Three sessions with Roja and I'd set boundaries I'd been avoiding for years. I finally sleep through the night.",
    name: 'Amira K.',
    context: 'Marketing Director',
  },
  {
    img: '/testimonial-2.jpg',
    quote:
      "The Reclaim Your Power program rewired how I talk to myself. Week 2's release work alone was worth the whole journey.",
    name: 'Daniel M.',
    context: 'Founder',
  },
  {
    img: '/testimonial-3.jpg',
    quote:
      "Roja makes deep work feel safe. EFT sounded strange to me - now it's the first thing I reach for when anxiety hits.",
    name: 'Sofia R.',
    context: 'Teacher',
  },
]

function Stars({ delay }: { delay: number }) {
  return (
    <div className="flex gap-1" aria-label="Rated 5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.3, delay: delay + i * 0.06, ease: SPRING }}
        >
          <Star className="h-4 w-4 fill-warm-gold text-warm-gold" aria-hidden="true" />
        </motion.span>
      ))}
    </div>
  )
}

function CountUp({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const dur = 1000
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(to * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])

  return (
    <span ref={ref}>
      {val.toFixed(decimals)}
      {suffix}
    </span>
  )
}

function TestimonialCard({ t, index }: { t: (typeof TESTIMONIALS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ rx: -py * 3, ry: px * 3 })
  }

  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: EASE }}
      onPointerMove={onMove}
      onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{ transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      className="relative min-w-[82%] snap-center rounded-[20px] border border-grey-line bg-white p-7 shadow-card transition-shadow duration-300 hover:-translate-y-1 hover:shadow-cta-glow sm:min-w-[60%] lg:min-w-0"
    >
      {/* quote ornament */}
      <motion.svg
        viewBox="0 0 32 24"
        aria-hidden="true"
        className="h-8 w-10 text-green-tint"
        initial={{ pathLength: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.path
          d="M2 22 C2 12 6 4 14 2 L15 6 C10 8 8 12 8 16 L14 16 L14 22 Z M18 22 C18 12 22 4 30 2 L31 6 C26 8 24 12 24 16 L30 16 L30 22 Z"
          fill="currentColor"
          initial={{ scale: 0, originX: 0, originY: 1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.12 + 0.2, ease: SPRING }}
        />
      </motion.svg>

      <div className="mt-4">
        <Stars delay={index * 0.12 + 0.25} />
      </div>

      <blockquote className="mt-4 text-[17px] leading-[1.65] text-text-body">
        “{t.quote}”
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3">
        <img
          src={t.img}
          alt={`Portrait of ${t.name}`}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-green-tint"
          loading="lazy"
        />
        <div>
          <p className="text-[15px] font-semibold text-deep-blue">{t.name}</p>
          <p className="text-sm text-text-body/80">{t.context}</p>
        </div>
      </figcaption>
    </motion.figure>
  )
}

export default function Testimonials() {
  const scroller = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const onScroll = () => {
    const el = scroller.current
    if (!el) return
    const cardW = el.scrollWidth / TESTIMONIALS.length
    setActive(Math.round(el.scrollLeft / cardW))
  }

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="relative bg-white">
      {/* wave divider from deep-blue section above */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute -top-[59px] left-0 h-[60px] w-full text-white"
      >
        <path d="M0 60 C 360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto max-w-site px-5 py-[72px] lg:px-10 lg:py-[120px]">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-green-600">
            Kind words
          </p>
          <h2
            id="testimonials-heading"
            className="font-display-lg mt-3 font-display text-[32px] font-medium leading-[1.12] text-deep-blue lg:text-5xl"
          >
            In their words.
          </h2>
          <p className="mt-4 text-[17px] leading-[1.65] text-text-body">
            Shared with permission. Names shortened for privacy.
          </p>
        </div>

        {/* Cards: snap carousel on mobile, offset row on desktop */}
        <div
          ref={scroller}
          onScroll={onScroll}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] lg:snap-none lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={i === 1 ? 'lg:translate-y-8' : ''}>
              <TestimonialCard t={t} index={i} />
            </div>
          ))}
        </div>

        {/* dots (mobile) */}
        <div className="mt-4 flex justify-center gap-2 lg:hidden" aria-hidden="true">
          {TESTIMONIALS.map((_, i) => (
            <span
              key={i}
              className={
                i === active
                  ? 'h-2 w-5 rounded-full bg-fresh-green transition-all'
                  : 'h-2 w-2 rounded-full bg-grey-line transition-all'
              }
            />
          ))}
        </div>

        {/* Aggregate strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-14 flex flex-col items-center gap-3 text-center lg:mt-24"
        >
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: SPRING }}
              >
                <Star className="h-5 w-5 fill-warm-gold text-warm-gold" aria-hidden="true" />
              </motion.span>
            ))}
          </div>
          <p className="text-[17px] font-semibold text-deep-blue">
            <CountUp to={5} decimals={1} /> · from <CountUp to={40} suffix="+" /> client reviews
          </p>
          <a
            href="https://instagram.com/GrowWithRoja"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-fresh-green-600"
          >
            <span className="relative">
              Read more on Instagram
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-fresh-green-600 transition-all duration-200 group-hover:w-full" />
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
