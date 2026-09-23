'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Instagram,
  Loader2,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const EMAIL = 'hello@growwithroja.com'

function ContactCards() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cards = [
    {
      icon: Instagram,
      title: 'Instagram',
      copy: 'Daily notes on mindset, tapping and growth.',
      handle: '@GrowWithRoja',
      action: (
        <a
          href="https://instagram.com/GrowWithRoja"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-fresh-green px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.97]"
        >
          Connect with Roja on Instagram
        </a>
      ),
    },
    {
      icon: Mail,
      title: 'Email',
      copy: 'For anything longer, or collaborations.',
      handle: EMAIL,
      action: (
        <span className="inline-flex items-center gap-2">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center rounded-full border-[1.5px] border-deep-blue px-6 py-3 text-[15px] font-semibold text-deep-blue transition-all hover:bg-deep-blue hover:text-white active:scale-[0.97]"
          >
            {EMAIL}
          </a>
          <span className="relative">
            <button
              onClick={copyEmail}
              aria-label="Copy email address"
              className="rounded-full border-[1.5px] border-grey-line p-3 text-text-body transition-all hover:border-fresh-green hover:text-fresh-green-600 active:scale-95"
            >
              {copied ? (
                <Check className="h-4 w-4 text-fresh-green" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-deep-blue px-3 py-1 text-xs font-semibold text-white"
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </span>
      ),
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      copy: 'Quickest reply — usually same day.',
      handle: 'Chat anytime',
      action: (
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border-[1.5px] border-deep-blue px-6 py-3 text-[15px] font-semibold text-deep-blue transition-all hover:bg-deep-blue hover:text-white active:scale-[0.97]"
        >
          Chat on WhatsApp
        </a>
      ),
    },
  ]

  return (
    <div className="mt-12 grid gap-5 md:grid-cols-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
          className="group flex flex-col items-center rounded-[20px] border border-grey-line bg-white p-8 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cta-glow"
        >
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.12 + 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-tint text-fresh-green-600 transition-colors duration-200 group-hover:bg-fresh-green group-hover:text-white"
          >
            <c.icon className="h-6 w-6" aria-hidden="true" />
          </motion.span>
          <h3 className="mt-5 text-[22px] font-semibold text-deep-blue">{c.title}</h3>
          <p className="mt-2 text-[15px] leading-[1.5] text-text-body">{c.copy}</p>
          <p className="mt-1 text-sm font-semibold text-fresh-green-600">{c.handle}</p>
          <div className="mt-6">{c.action}</div>
        </motion.div>
      ))}
    </div>
  )
}

function MiniForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const valid = name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && message.trim().length > 3

  const submit = () => {
    if (!valid || sending) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
    }, 800)
  }

  const field =
    'w-full rounded-xl border-[1.5px] border-grey-line bg-white px-4 py-3.5 text-[15px] text-deep-blue transition-shadow focus:border-fresh-green focus:ring-[3px] focus:ring-green-tint focus:outline-none'

  return (
    <div className="mx-auto mt-10 max-w-xl">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mx-auto flex items-center gap-2 text-[15px] font-semibold text-deep-blue transition-colors hover:text-fresh-green-600"
      >
        Prefer to write here?
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-[20px] border border-grey-line bg-white p-6 shadow-card sm:p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex flex-col items-center gap-3 py-4 text-center"
                >
                  <CheckCircle2 className="h-10 w-10 text-fresh-green" aria-hidden="true" />
                  <p className="text-[15px] font-semibold text-deep-blue">
                    Thanks {name.trim().split(' ')[0]} — Roja will reply within 24 hours.
                  </p>
                  <p className="text-sm text-text-body/70">
                    (Demo — no message is actually sent.)
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      aria-label="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className={field}
                    />
                    <input
                      aria-label="Your email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className={field}
                    />
                  </div>
                  <textarea
                    aria-label="Your message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What's on your mind?"
                    className={`${field} resize-none`}
                  />
                  <button
                    onClick={submit}
                    disabled={!valid || sending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-fresh-green py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" /> Send message
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="relative bg-blue-tint">
      {/* wave divider from #book */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute -top-[59px] left-0 h-[60px] w-full text-blue-tint"
      >
        <path d="M0 60 C 360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto max-w-site px-5 py-[72px] lg:px-10 lg:py-[120px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-green-600">
            Say hello
          </p>
          <h2
            id="contact-heading"
            className="font-display-lg mt-3 font-display text-[32px] font-medium leading-[1.12] text-deep-blue lg:text-5xl"
          >
            Not ready to book? Just reach out.
          </h2>
          <p className="mt-4 text-[17px] leading-[1.65] text-text-body">
            Questions about coaching, the program, or whether this is right for you — I'd love to
            hear from you.
          </p>
        </div>

        <ContactCards />
        <MiniForm />

        <motion.p
          initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
          whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: EASE }}
          className="mt-14 text-center font-script text-[28px] leading-snug text-fresh-green-600"
        >
          “Wherever you are is a fine place to start. — Roja”
        </motion.p>
      </div>
    </section>
  )
}
