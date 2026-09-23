'use client'

import { useState, type FormEvent } from 'react'
import { Instagram, Facebook, Youtube, Mail, MapPin, ArrowRight, Send } from 'lucide-react'
import { scrollToId } from '@/lib/scroll'
import { LeafMark } from './Navbar'

const EXPLORE_LINKS = [
  { label: 'About', id: 'about' },
  { label: 'How I Can Help', id: 'help' },
  { label: 'My Approach', id: 'approach' },
  { label: 'Reclaim Your Power', id: 'program' },
  { label: 'Testimonials', id: 'testimonials' },
]

const SUPPORT_LINKS = [
  { label: 'Book a Session', id: 'book' },
  { label: 'Contact', id: 'contact' },
]

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/growwithroja', Icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com/growwithroja', Icon: Facebook },
  { label: 'YouTube', href: 'https://youtube.com/@growwithroja', Icon: Youtube },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim() || status === 'sending') return

    setStatus('sending')
    try {
      // Wire this to your newsletter endpoint when ready.
      await new Promise((resolve) => setTimeout(resolve, 700))
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-deep-blue text-white">
      {/* Soft ambient glow, decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(700px 500px at 90% -10%, rgba(63,164,106,0.18) 0%, rgba(63,164,106,0) 65%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-screen"
        style={{ backgroundImage: 'url(/texture-grain.png)', backgroundSize: '512px' }}
      />

      <div className="relative mx-auto max-w-site px-5 pb-10 pt-16 sm:pt-20 lg:px-10">
        {/* Top: brand + newsletter CTA band */}
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-2 md:gap-16 md:pb-14">
          <div className="max-w-md">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-left text-lg font-semibold"
              aria-label="Grow With Roja, back to top"
            >
              <LeafMark className="h-5 w-5 text-fresh-green" />
              Grow With{' '}
              <span className="font-display italic text-fresh-green">Roja</span>
            </button>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Life &amp; mindset coaching for thoughtful people. NLP, EFT,
              Ho&apos;oponopono and deep belief work, online via Zoom.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-fresh-green hover:bg-fresh-green hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:pl-6 lg:pl-12">
            <h3 className="font-display text-2xl font-medium text-white sm:text-[28px]">
              Gentle notes, straight to your inbox.
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-white/70">
              One short letter a month. Reflections, tools, and the occasional
              invitation. No noise, unsubscribe anytime.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch"
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[14px] text-white placeholder:text-white/40 outline-none transition-colors focus:border-fresh-green focus:bg-white/10"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-fresh-green px-6 py-3 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'sending' ? 'Sending…' : 'Subscribe'}
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <p
              role="status"
              aria-live="polite"
              className="mt-3 min-h-[1.25rem] text-[13px]"
            >
              {status === 'success' && (
                <span className="text-fresh-green">
                  Thank you, you&apos;re on the list.
                </span>
              )}
              {status === 'error' && (
                <span className="text-alert-red">
                  Something went wrong. Please try again.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Middle: link columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Explore
            </h4>
            <ul className="mt-5 space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToId(link.id)}
                    className="group inline-flex items-center gap-1.5 text-[14px] text-white/85 transition-colors hover:text-fresh-green"
                  >
                    {link.label}
                    <ArrowRight
                      className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Get Support
            </h4>
            <ul className="mt-5 space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToId(link.id)}
                    className="group inline-flex items-center gap-1.5 text-[14px] text-white/85 transition-colors hover:text-fresh-green"
                  >
                    {link.label}
                    <ArrowRight
                      className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 md:col-span-2">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">
              Reach Out
            </h4>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3 text-[14px] text-white/85">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <Mail className="h-4 w-4 text-fresh-green" aria-hidden="true" />
                </span>
                <a
                  href="mailto:hello@growwithroja.com"
                  className="transition-colors hover:text-fresh-green"
                >
                  hello@growwithroja.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white/85">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <MapPin className="h-4 w-4 text-fresh-green" aria-hidden="true" />
                </span>
                <span>
                  Sessions held online via Zoom
                  <br />
                  <span className="text-white/55">Open to clients worldwide</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-[13px] text-white/55">
            © {year} Grow With Roja. All rights reserved.
          </p>
          <p className="text-[13px] text-white/45">
            Crafted with care by{' '}
            <a
              href="#"
              className="font-medium text-white/70 transition-colors hover:text-fresh-green"
            >
              BatoBuzz Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
