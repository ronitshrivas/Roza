'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { scrollToId } from '@/lib/scroll'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const PHILOSOPHY = [
  { lead: 'Gentle, not soft.', rest: 'Deep work delivered with kindness.' },
  { lead: 'Tools you keep.', rest: 'Every session ends with something practical.' },
  { lead: 'Your pace, your pace.', rest: 'No hustle-culture timelines.' },
]

const CHIPS = [
  'Certified NLP Practitioner',
  'EFT (Tapping) Certified',
  "Ho'oponopono Facilitator",
  '100+ client sessions',
]

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative bg-soft-grey">
      {/* wave divider */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute -top-[59px] left-0 h-[60px] w-full text-soft-grey"
      >
        <path d="M0 60 C 360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto flex max-w-site flex-col gap-12 px-5 py-[72px] lg:flex-row lg:items-start lg:gap-16 lg:px-10 lg:py-[120px]">
        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative lg:w-[40%]"
        >
          <img
            src="/leaf-line.svg"
            alt=""
            aria-hidden="true"
            className="absolute -left-8 -top-8 h-32 w-32 opacity-25"
          />
          <motion.div
            whileHover={{ rotate: 0 }}
            className="relative rotate-[1.5deg] rounded-[20px] bg-white p-3 shadow-card transition-shadow duration-300 hover:shadow-cta-glow"
          >
            <img
              src="/roja-about.jpg"
              alt="Roja seated by a window in soft natural light"
              className="aspect-[4/5] w-full rounded-[14px] object-cover"
              loading="lazy"
            />
          </motion.div>
          <p className="mt-4 text-center font-script text-xl text-fresh-green-600">
            Coach, NLP &amp; EFT practitioner, fellow work-in-progress.
          </p>
        </motion.div>

        {/* Copy */}
        <div className="lg:w-[60%]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-green-600">
            About Roja
          </p>
          <h2
            id="about-heading"
            className="font-display-lg mt-3 font-display text-[32px] font-medium leading-[1.12] text-deep-blue lg:text-5xl"
          >
            Real change starts when you stop fighting yourself.
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-6 space-y-4 text-[17px] leading-[1.65] text-text-body"
          >
            <p>
              I didn't come to this work from a textbook - I came to it through my own
              burnout, my own self-doubt, and the slow realisation that pushing harder
              was never the answer. What changed everything was learning to work
              <em> with</em> myself instead of against myself.
            </p>
            <p>
              Here's what I believe: people aren't broken - they're patterned. And
              patterns, with compassion and the right tools, can be rewired. That's the
              work I do now, and there's nothing I'd rather help you with.
            </p>
          </motion.div>

          <ul className="mt-8 space-y-4">
            {PHILOSOPHY.map((p, i) => (
              <motion.li
                key={p.lead}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                className="flex items-start gap-3"
              >
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-tint">
                  <Check className="h-3.5 w-3.5 text-fresh-green-600" aria-hidden="true" />
                </span>
                <span className="text-[17px] leading-[1.65] text-text-body">
                  <strong className="font-semibold text-deep-blue">{p.lead}</strong> {p.rest}
                </span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-2">
            {CHIPS.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                className="rounded-full bg-green-tint px-3.5 py-1.5 text-xs font-semibold text-fresh-green-600"
              >
                {c}
              </motion.span>
            ))}
          </div>

          <button
            onClick={() => scrollToId('book')}
            className="group mt-8 inline-flex items-center gap-1.5 text-[15px] font-semibold text-fresh-green-600"
          >
            <span className="relative">
              Book a free discovery call
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-fresh-green-600 transition-all duration-200 group-hover:w-full" />
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
