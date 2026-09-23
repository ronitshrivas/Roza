'use client'
import { useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { scrollToId } from '@/lib/scroll'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const MODALITIES = [
  {
    name: 'NLP',
    sub: 'Neuro-Linguistic Programming',
    icon: '/icon-nlp.svg',
    summary:
      'How your inner language shapes your outer life. We find the sentences running you, and rewrite them.',
    detail:
      'In a session: we map a specific thought loop, trace where it started, and rehearse a new response until it feels natural.',
  },
  {
    name: 'EFT',
    sub: 'Emotional Freedom Technique',
    icon: '/icon-eft.svg',
    summary:
      'Gentle tapping on acupressure points while we talk - it calms the nervous system so change can actually stick.',
    detail:
      "In a session: I'll guide you through a simple tapping sequence you can repeat anytime anxiety spikes.",
  },
  {
    name: "Ho'oponopono",
    sub: 'Reconciliation & release',
    icon: '/icon-hooponopono.svg',
    summary:
      'A Hawaiian practice of reconciliation and release - four phrases that help you let go of old weight.',
    detail:
      'In a session: we use it to close loops with people, memories, or versions of yourself you still carry.',
  },
  {
    name: 'Mindset & Belief Work',
    sub: 'The core of everything',
    icon: '/icon-mindset.svg',
    summary:
      'The core of everything: surfacing the quiet beliefs underneath your patterns, and choosing better ones.',
    detail:
      'In a session: we catch a limiting belief in the wild, test it against your actual life, and install an upgrade.',
  },
]

function WordReveal({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: 24, rotate: 2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
        >
          {w}
          {i < text.split(' ').length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  )
}

export default function Approach() {
  const [open, setOpen] = useState<number>(0)
  const stripRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stripRef,
    offset: ['start end', 'end start'],
  })
  const driftY = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <section id="approach" aria-labelledby="approach-heading" className="relative bg-blue-tint">
      {/* wave divider from previous (white) section */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute -top-[59px] left-0 h-[60px] w-full text-blue-tint"
      >
        <path d="M0 60 C 360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto max-w-site px-5 py-[72px] lg:px-10 lg:py-[120px]">
        {/* Header */}
        <div className="max-w-2xl text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-green-600"
          >
            The Approach
          </motion.p>
          <h2
            id="approach-heading"
            className="font-display-lg mt-3 font-display text-[32px] font-medium leading-[1.12] text-deep-blue lg:text-5xl"
          >
            <WordReveal text="Simple tools. Deep shifts." />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-5 text-[17px] leading-[1.65] text-text-body"
          >
            Every session blends a few of these - always explained, always at your pace.
            Nothing is ever done <em>to</em> you.
          </motion.p>
        </div>

        {/* Cards: mobile accordion / desktop 2×2 with inline expansion */}
        <div className="mt-12 grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-6">
          {MODALITIES.map((m, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={m.name}
                layout="position"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                className={cn(
                  'group relative overflow-hidden rounded-[20px] border bg-white shadow-card transition-all duration-300',
                  isOpen
                    ? 'border-fresh-green/40 shadow-cta-glow lg:-translate-y-1'
                    : 'border-grey-line hover:-translate-y-1 hover:shadow-cta-glow',
                )}
              >
                {/* top accent bar */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-0 h-[3px] bg-fresh-green transition-all duration-300',
                    isOpen ? 'w-full' : 'w-10 group-hover:w-full',
                  )}
                />
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`approach-detail-${i}`}
                  className="flex w-full items-start gap-4 p-6 text-left transition-transform duration-150 active:scale-[0.99] lg:p-7"
                >
                  <motion.img
                    src={m.icon}
                    alt=""
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: EASE }}
                    className="h-14 w-14 shrink-0 lg:h-16 lg:w-16"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[22px] font-semibold leading-snug text-deep-blue">
                      {m.name}
                    </span>
                    <span className="mt-0.5 block text-[13px] font-semibold uppercase tracking-[0.08em] text-fresh-green-600">
                      {m.sub}
                    </span>
                    <span className="mt-3 block text-[15px] leading-[1.6] text-text-body">
                      {m.summary}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'mt-1 h-5 w-5 shrink-0 text-fresh-green-600 transition-transform duration-300 ease-soft-out',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`approach-detail-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-grey-line px-6 py-5 text-[15px] italic leading-[1.6] text-text-body lg:px-7">
                        {m.detail}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Closing strip with drift-up parallax */}
        <div ref={stripRef} className="mt-16 text-center lg:mt-20">
          <motion.blockquote
            style={{ y: driftY }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mx-auto max-w-2xl font-display text-[24px] font-medium italic leading-[1.4] text-deep-blue lg:text-[28px]"
          >
            "You don't need to know how they work. That's my job. You just need to show up."
          </motion.blockquote>
          <button
            onClick={() => scrollToId('contact')}
            className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-fresh-green-600"
          >
            <span className="relative">
              Ask Roja a question
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-fresh-green-600 transition-all duration-200 group-hover:w-full" />
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
