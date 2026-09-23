'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { scrollToId } from '@/lib/scroll'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile menu is open, and close on Escape.
  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const handleNavigate = (id: string) => {
    setMenuOpen(false)
    scrollToId(id)
  }

  const handleLogo = () => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-colors duration-300 ease-soft-out',
          scrolled
            ? 'border-b border-grey-line bg-white/90 backdrop-blur'
            : 'border-b border-transparent bg-white/0',
        )}
      >
        <div className="mx-auto flex max-w-site items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 lg:px-10">
          <button
            onClick={handleLogo}
            className="flex shrink-0 items-center gap-2 text-left text-deep-blue"
            aria-label="Grow With Roja - back to top"
          >
            <LeafMark className="h-5 w-5 text-fresh-green" />
            <span className="text-[15px] font-semibold tracking-tight sm:text-[17px]">
              Grow With{' '}
              <span className="font-display italic text-fresh-green">Roja</span>
            </span>
          </button>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-7" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className="text-[14px] font-medium text-text-body transition-colors hover:text-fresh-green-600"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleNavigate('book')}
              className="hidden rounded-full bg-fresh-green px-5 py-2.5 text-[14px] font-semibold tracking-[0.01em] text-white transition-all duration-200 hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.97] sm:inline-flex sm:px-6 sm:text-[15px]"
            >
              Book a Session
            </button>
            <button
              className="rounded-full p-2 text-deep-blue lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-deep-blue px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[17px] font-semibold">
                <LeafMark className="h-5 w-5 text-fresh-green" />
                Grow With{' '}
                <span className="font-display italic text-fresh-green">Roja</span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-7 w-7" />
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-5 sm:mt-14 sm:gap-6" aria-label="Mobile">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.08 + i * 0.05,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => handleNavigate(link.id)}
                  className="text-left font-display text-3xl font-medium text-white/90 transition-colors hover:text-fresh-green sm:text-4xl"
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>

            <button
              onClick={() => handleNavigate('book')}
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
