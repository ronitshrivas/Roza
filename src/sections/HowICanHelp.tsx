'use client'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BatteryLow,
  CloudRain,
  Compass,
  Repeat,
  Shield,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { scrollToId } from '@/lib/scroll'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

interface Card {
  title: string
  copy: string
  icon: LucideIcon
}

const CARDS: Card[] = [
  {
    title: 'Emotional exhaustion',
    copy: "You're functioning, but running on empty. Rest doesn't seem to touch it.",
    icon: BatteryLow,
  },
  {
    title: 'Self-doubt',
    copy: 'A quiet inner critic talks you out of things before you begin.',
    icon: CloudRain,
  },
  {
    title: 'Boundaries',
    copy: 'You say yes when every part of you means no — and pay for it later.',
    icon: Shield,
  },
  {
    title: 'Recurring patterns',
    copy: "Different job, different relationship… same ending. You're ready to see why.",
    icon: Repeat,
  },
  {
    title: 'Feeling stuck',
    copy: "You know something needs to change. You just can't see the next step.",
    icon: Compass,
  },
]

function HelpCard({ card, index }: { card: Card; index: number }) {
  const Icon = card.icon
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
      className="group relative flex min-h-[320px] w-[78vw] max-w-[320px] shrink-0 snap-center flex-col overflow-hidden rounded-[20px] border border-grey-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cta-glow lg:w-auto lg:max-w-none"
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-[3px] w-10 bg-fresh-green transition-all duration-300 group-hover:w-full"
      />
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-tint transition-transform duration-300 group-hover:-rotate-[8deg]">
        <Icon className="h-5 w-5 text-fresh-green-600" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-[22px] font-semibold leading-snug text-deep-blue">{card.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-text-body">{card.copy}</p>
      <button
        onClick={() => scrollToId('book')}
        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-left text-[14px] font-semibold text-fresh-green-600"
      >
        This is me
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </motion.article>
  )
}

export default function HowICanHelp() {
  return (
    <section id="help" aria-labelledby="help-heading" className="bg-white">
      <div className="mx-auto max-w-site px-5 py-[72px] lg:px-10 lg:py-[120px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-green-600">
            How I Can Help
          </p>
          <h2
            id="help-heading"
            className="font-display-lg mt-3 font-display text-[32px] font-medium leading-[1.12] text-deep-blue lg:text-5xl"
          >
            Does any of this sound familiar?
          </h2>
          <p className="mt-4 text-[17px] leading-[1.65] text-text-body">
            Most of my clients arrive carrying one (or more) of these. All of them are
            workable.
          </p>
        </div>

        {/* Mobile: snap carousel / Desktop: grid */}
        <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-5">
          {CARDS.map((c, i) => (
            <HelpCard key={c.title} card={c} index={i} />
          ))}
        </div>

        <p className="mt-4 text-center text-xs uppercase tracking-[0.14em] text-text-body/50 lg:hidden" aria-hidden="true">
          Swipe to explore
        </p>
      </div>
    </section>
  )
}
