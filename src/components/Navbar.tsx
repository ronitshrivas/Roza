'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { scrollToId } from '@/lib/scroll'
import { cn } from '@/lib/utils'

const LINKS = [
  { label: 'About', id: 'about' },
  { label: 'How I Can Help', id: 'help' },
  { label: 'Approach', id: 'approach' },
  { label: 'Reclaim Your Power', id: 'program' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'Contact', id: 'contact' },
]

export function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21 C 12 14, 12 8, 13 3 M12 16 C 9 14.5, 7 12, 6.5 9 C 9.5 10, 11.5 12.5, 12 16 Z M12.5 10 C 15 8.5, 17 6, 17.5 3.5 C 14.5 4.5, 12.8 7, 12.5 10 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300 ease-soft-out',
          scrolled
            ? 'border-b border-grey-line bg-white/90 text-deep-blue backdrop-blur'
            : 'border-b border-transparent bg-white/0 text-deep-blue',
        )}
      >
        <div className="mx-auto flex max-w-site items-center justify-between px-5 py-4 lg:px-10">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-left"
            aria-label="Grow With Roja — back to top"
          >
            <LeafMark className="h-5 w-5 text-fresh-green" />
            <span className="text-[17px] font-semibold tracking-tight">
              Grow With{' '}
              <span className="font-display italic text-fresh-green">Roja</span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="text-[14px] font-medium text-text-body transition-colors hover:text-fresh-green-600"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => go('book')}
              className={cn(
                'rounded-full bg-fresh-green px-6 text-[15px] font-semibold tracking-[0.01em] text-white transition-all duration-200 hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.97]',
                scrolled ? 'py-2.5' : 'py-3.5',
              )}
            >
              Book a Session
            </button>
            <button
              className="rounded-full p-2 text-deep-blue lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col bg-deep-blue px-6 py-6 text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[17px] font-semibold">
                <LeafMark className="h-5 w-5 text-fresh-green" />
                Grow With <span className="font-display italic text-fresh-green">Roja</span>
              </span>
              <motion.button
                initial={{ rotate: 0 }}
                animate={{ rotate: 90 }}
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2"
              >
                <X className="h-7 w-7" />
              </motion.button>
            </div>
            <nav className="mt-14 flex flex-col gap-6" aria-label="Mobile">
              {[...LINKS, { label: 'Book a Session', id: 'book' }].map((l, i) => (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => go(l.id)}
                  className="text-left font-display text-4xl font-medium text-white/90 transition-colors hover:text-fresh-green"
                >
                  {l.label}
                </motion.button>
              ))}
            </nav>
            <button
              onClick={() => go('book')}
              className="mt-auto rounded-full bg-fresh-green py-4 text-center text-[15px] font-semibold text-white transition-colors hover:bg-fresh-green-600"
            >
              Book a Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
