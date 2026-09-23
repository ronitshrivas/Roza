'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Leaf,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  confirmFreeBooking,
  fetchServices,
  getAvailability,
  holdBooking,
  payBooking,
  type ApiService,
  type AvailabilityDay,
} from '@/lib/booking-api'
import {
  EMAIL_RE,
  SERVICES,
  clearDraft,
  downloadIcs,
  formatDate,
  formatDateLong,
  googleCalendarUrl,
  loadDraft,
  saveDraft,
  toISODate,
  type BookingDraft,
  type Service,
} from './booking-utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const STEP_LABELS = ['Service', 'Time', 'Details', 'Payment', 'Done']

/** Shape a service document from Firestore into the wizard's display model. */
function mapApiService(s: ApiService): Service {
  const free = s.priceCents === 0
  const signature = s.slug.includes('reclaim')
  return {
    id: s.slug,
    name: s.title,
    minutes: s.durationMin,
    price: s.priceCents / 100,
    blurb: s.description ?? '',
    chip: free ? 'FREE' : signature ? 'Signature' : undefined,
    chipGold: signature,
  }
}

interface Toast {
  id: number
  message: string
}

let toastId = 0

/* ---------------- Toasts ---------------- */

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-[14px] border border-grey-line bg-white px-4 py-3 shadow-card"
            role="status"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-fresh-green" aria-hidden="true" />
            <p className="text-sm font-medium text-deep-blue">{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ---------------- Progress header ---------------- */

function ProgressHeader({ displayStep }: { displayStep: number }) {
  return (
    <div className="border-b border-grey-line px-5 py-5 sm:px-8">
      <ol className="flex items-center" aria-label="Booking progress">
        {STEP_LABELS.map((label, i) => {
          const done = i < displayStep
          const current = i === displayStep
          return (
            <li key={label} className={cn('flex items-center', i < STEP_LABELS.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-300',
                    done
                      ? 'border-fresh-green bg-fresh-green text-white'
                      : current
                        ? 'border-fresh-green bg-white text-fresh-green-600'
                        : 'border-grey-line bg-white text-text-body/50',
                  )}
                  aria-current={current ? 'step' : undefined}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-semibold sm:text-xs',
                    current ? 'text-deep-blue' : done ? 'text-fresh-green-600' : 'text-text-body/50',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="relative mx-1 mb-5 h-0.5 flex-1 rounded bg-grey-line sm:mx-2">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded bg-fresh-green"
                    initial={false}
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------------- Summary rail ---------------- */

function SummaryRail({
  draft,
  services,
  holdLeft,
  confirmed,
  reference,
}: {
  draft: BookingDraft
  services: Service[]
  holdLeft: number | null
  confirmed: boolean
  reference: string | null
}) {
  const service = services.find((s) => s.id === draft.serviceId)
  const mm = holdLeft !== null ? Math.floor(holdLeft / 60000) : 0
  const ss = holdLeft !== null ? Math.floor((holdLeft % 60000) / 1000) : 0

  return (
    <aside className="relative hidden w-[320px] shrink-0 overflow-hidden rounded-r-[24px] bg-blue-tint lg:block">
      <img
        src="/calm-abstract.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
      />
      <div className="relative flex h-full flex-col p-7">
        {confirmed ? (
          <>
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-fresh-green-600">
              What happens next
            </h3>
            <ol className="mt-6 space-y-5">
              {[
                'Confirmation email lands in your inbox with all the details.',
                'A gentle reminder arrives 24 hours before your session.',
                'Join via the Zoom link — it activates 15 minutes early.',
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-fresh-green-600 shadow-card">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-[1.5] text-text-body">{text}</p>
                </li>
              ))}
            </ol>
            {reference && (
              <p className="mt-auto rounded-xl bg-white/70 px-4 py-3 text-center text-sm font-semibold text-deep-blue">
                Ref: {reference}
              </p>
            )}
          </>
        ) : (
          <>
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-fresh-green-600">
              Your booking
            </h3>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-fresh-green-600" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-deep-blue">Service</dt>
                  <dd className="text-text-body">{service ? service.name : 'Not selected yet'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-fresh-green-600" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-deep-blue">Date</dt>
                  <dd className="text-text-body">{draft.date ? formatDateLong(draft.date) : 'Pick a day'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-fresh-green-600" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-deep-blue">Time</dt>
                  <dd className="text-text-body">{draft.slot ?? 'Choose a slot'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-fresh-green-600" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-deep-blue">Price</dt>
                  <dd className="text-text-body">
                    {service ? (service.price === 0 ? 'Free' : `$${service.price}`) : '—'}
                  </dd>
                </div>
              </div>
            </dl>

            {holdLeft !== null && (
              <div className="mt-5 rounded-xl bg-white px-4 py-3 shadow-card" role="timer" aria-live="off">
                <p className="text-xs font-semibold uppercase tracking-wide text-fresh-green-600">
                  Slot held
                </p>
                <p className="mt-0.5 font-display text-2xl font-medium tabular-nums text-deep-blue">
                  {mm}:{String(ss).padStart(2, '0')}
                </p>
              </div>
            )}

            <div className="mt-auto flex items-center gap-2 rounded-xl bg-white/70 px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 text-fresh-green-600" aria-hidden="true" />
              <p className="text-xs font-medium text-text-body">Your details stay private</p>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

/* ---------------- Step 1: Service ---------------- */

function StepService({
  draft,
  services,
  onSelect,
}: {
  draft: BookingDraft
  services: Service[]
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h3 className="font-display text-[22px] font-medium text-deep-blue lg:text-[28px]">
        Choose your service
      </h3>
      <div className="mt-6 space-y-4" role="radiogroup" aria-label="Services">
        {services.map((s) => {
          const selected = draft.serviceId === s.id
          return (
            <button
              key={s.id}
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(s.id)}
              className={cn(
                'relative w-full rounded-[20px] border-2 p-5 text-left transition-all duration-200 active:scale-[0.99]',
                selected
                  ? 'border-fresh-green bg-green-tint/60'
                  : 'border-grey-line bg-white hover:border-fresh-green/50 hover:shadow-card',
              )}
            >
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ease: [0.34, 1.56, 0.64, 1], duration: 0.3 }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-fresh-green text-white"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </motion.span>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[17px] font-semibold text-deep-blue">{s.name}</span>
                {s.chip && (
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      s.chipGold ? 'bg-warm-gold/15 text-warm-gold' : 'bg-green-tint text-fresh-green-600',
                    )}
                  >
                    {s.chip}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-[1.5] text-text-body">
                {s.minutes} min · {s.blurb}
              </p>
              <p className="mt-2 text-[15px] font-semibold text-deep-blue">
                {s.price === 0 ? '$0' : `$${s.price}`}
                {s.id.startsWith('reclaim') && (
                  <span className="ml-2 text-sm font-normal text-text-body/80">(or 2 × $350)</span>
                )}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- Step 2: Calendar & slots ---------------- */

interface CalDay {
  iso: string
  day: number
  inMonth: boolean
  past: boolean
  available: boolean
  today: boolean
}

function buildMonth(
  year: number,
  month: number,
  isAvailable: (iso: string) => boolean,
): CalDay[] {
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const todayIso = toISODate(new Date())
  const days: CalDay[] = []
  for (let i = 0; i < 42; i++) {
    const dnum = i - startDow + 1
    let m = month
    let d = dnum
    let inMonth = true
    if (dnum < 1) {
      m = month - 1
      d = daysInPrev + dnum
      inMonth = false
    } else if (dnum > daysInMonth) {
      m = month + 1
      d = dnum - daysInMonth
      inMonth = false
    }
    const date = new Date(year, m, d)
    const iso = toISODate(date)
    const past = iso < todayIso
    days.push({
      iso,
      day: d,
      inMonth,
      past,
      today: iso === todayIso,
      available: inMonth && !past && isAvailable(iso),
    })
  }
  return days
}

function StepTime({
  draft,
  onPick,
  onSlot,
}: {
  draft: BookingDraft
  onPick: (iso: string | null) => void
  onSlot: (time: string) => void
}) {
  const now = new Date()
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [availData, setAvailData] = useState<AvailabilityDay[] | null>(null)
  const [availLoading, setAvailLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setAvailLoading(true)
    getAvailability({ year: view.year, month: view.month + 1 })
      .then((res) => {
        if (!cancelled) setAvailData(res.data)
      })
      .catch(() => {
        if (!cancelled) setAvailData([])
      })
      .finally(() => {
        if (!cancelled) setAvailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [view.year, view.month])

  const availMap = useMemo(
    () => new Map((availData ?? []).map((d) => [d.date, d.times] as const)),
    [availData],
  )
  const days = useMemo(
    () => buildMonth(view.year, view.month, (iso) => availMap.has(iso)),
    [view, availMap],
  )
  // undefined = still loading, null = day unavailable/fully booked
  const slots = draft.date
    ? availMap.has(draft.date)
      ? availMap.get(draft.date)!.map((t) => ({ time: t.start, booked: t.booked }))
      : availLoading
        ? undefined
        : null
    : null

  const canPrev = view.year > now.getFullYear() || view.month > now.getMonth()
  const next = () =>
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }))
  const prev = () => {
    if (!canPrev) return
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }))
  }

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const gridRef = useRef<HTMLDivElement>(null)
  const onGridKey = (e: React.KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return
    const target = e.target as HTMLElement
    const iso = target.dataset.iso
    if (!iso) return
    if (e.key === 'Enter') {
      const day = days.find((d) => d.iso === iso)
      if (day?.available) onPick(iso)
      return
    }
    e.preventDefault()
    const idx = days.findIndex((d) => d.iso === iso)
    const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' ? -7 : 7
    const nextDay = days[idx + delta]
    if (nextDay) {
      const el = gridRef.current?.querySelector<HTMLElement>(`[data-iso="${nextDay.iso}"]`)
      el?.focus()
    }
  }

  return (
    <div>
      <h3 className="font-display text-[22px] font-medium text-deep-blue lg:text-[28px]">
        Pick a date &amp; time
      </h3>
      <p className="mt-1 text-sm text-text-body/80">
        Times shown in your local timezone (auto-detected).
      </p>

      <div className="mt-6 lg:flex lg:gap-6">
        {/* Calendar */}
        <div className="rounded-[20px] border border-grey-line bg-white p-4 sm:p-5 lg:flex-1">
          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous month"
              className="rounded-full p-2 text-deep-blue transition-colors hover:bg-soft-grey disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="text-[15px] font-semibold text-deep-blue" aria-live="polite">
              {monthLabel}
            </p>
            <button
              onClick={next}
              aria-label="Next month"
              className="rounded-full p-2 text-deep-blue transition-colors hover:bg-soft-grey"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-text-body/60">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          <div
            ref={gridRef}
            className="grid grid-cols-7 gap-1"
            role="grid"
            aria-label={`Days in ${monthLabel}`}
            onKeyDown={onGridKey}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {days.map((d, i) => {
                const selected = draft.date === d.iso
                return (
                  <motion.button
                    key={`${view.year}-${view.month}-${d.iso}`}
                    data-iso={d.iso}
                    role="gridcell"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.008 }}
                    disabled={!d.available}
                    tabIndex={d.available ? 0 : -1}
                    onClick={() => onPick(d.iso)}
                    aria-label={`${formatDateLong(d.iso)}${d.available ? '' : ' (unavailable)'}`}
                    aria-pressed={selected}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-all',
                      !d.inMonth && 'invisible',
                      d.available && !selected && 'text-deep-blue hover:bg-blue-tint',
                      !d.available && d.inMonth && 'cursor-not-allowed text-text-body/30',
                      selected && 'bg-fresh-green font-semibold text-white shadow-card',
                      d.today && !selected && 'ring-2 ring-fresh-green',
                    )}
                  >
                    {d.day}
                    {d.available && !selected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-fresh-green" aria-hidden="true" />
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Slots */}
        <div className="mt-5 lg:mt-0 lg:w-[240px] lg:shrink-0">
          <AnimatePresence mode="wait">
            {draft.date ? (
              <motion.div
                key={draft.date}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="rounded-[20px] border border-grey-line bg-soft-grey p-4 sm:p-5"
              >
                <p className="text-sm font-semibold text-deep-blue">
                  {formatDate(draft.date)} — available times
                </p>
                {slots === undefined ? (
                  <div className="mt-4 flex flex-col items-center gap-2 py-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-fresh-green/70" aria-hidden="true" />
                    <p className="text-sm text-text-body">Loading times…</p>
                  </div>
                ) : slots === null ? (
                  <div className="mt-4 flex flex-col items-center gap-2 py-4 text-center">
                    <Leaf className="h-8 w-8 text-fresh-green/60" aria-hidden="true" />
                    <p className="text-sm text-text-body">
                      Roja is fully booked this day — try another date
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 lg:flex-col">
                    {slots.map((s, i) => {
                      const active = draft.slot === s.time
                      return (
                        <motion.button
                          key={s.time}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.04 }}
                          disabled={s.booked}
                          title={s.booked ? 'Booked' : undefined}
                          onClick={() => onSlot(s.time)}
                          className={cn(
                            'rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97]',
                            s.booked &&
                              'cursor-not-allowed border-grey-line text-text-body/40 line-through',
                            !s.booked &&
                              !active &&
                              'border-grey-line bg-white text-deep-blue hover:border-fresh-green hover:text-fresh-green-600',
                            active && 'border-fresh-green bg-fresh-green text-white shadow-card',
                          )}
                        >
                          {s.time}
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-[20px] border border-dashed border-grey-line p-5 text-center text-sm text-text-body/70"
              >
                Select a day with a green dot to see times.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Step 3: Details ---------------- */

const FOCUS_CHIPS = [
  'Emotional exhaustion',
  'Self-doubt',
  'Boundaries',
  'Recurring patterns',
  'Feeling stuck',
  'Something else',
]

interface FieldErrors {
  name?: string
  email?: string
  consent?: string
}

function StepDetails({
  draft,
  update,
  errors,
  setErrors,
}: {
  draft: BookingDraft
  update: (patch: Partial<BookingDraft>) => void
  errors: FieldErrors
  setErrors: (e: FieldErrors) => void
}) {
  const [shake, setShake] = useState<string | null>(null)

  const field =
    'w-full rounded-xl border-[1.5px] border-grey-line bg-white px-4 py-3.5 text-[15px] text-deep-blue transition-shadow focus:border-fresh-green focus:ring-[3px] focus:ring-green-tint focus:outline-none'

  const validate = (key: keyof FieldErrors, value: string | boolean) => {
    let msg: string | undefined
    if (key === 'name' && !String(value).trim()) msg = 'Please enter your name.'
    if (key === 'email' && !EMAIL_RE.test(String(value))) msg = 'Please enter a valid email address.'
    if (key === 'consent' && !value) msg = 'Please agree so Roja can contact you about this booking.'
    setErrors({ ...errors, [key]: msg })
    if (msg) {
      setShake(key)
      setTimeout(() => setShake(null), 300)
    }
  }

  const addChip = (chip: string) => {
    const note = chip === 'Something else' ? '' : chip
    const next = draft.notes ? (draft.notes.includes(chip) ? draft.notes : `${draft.notes}; ${note}`.replace(/;\s*$/, '')) : note
    update({ notes: next.slice(0, 500) })
  }

  return (
    <div>
      <h3 className="font-display text-[22px] font-medium text-deep-blue lg:text-[28px]">
        Your details
      </h3>
      <div className="mt-6 space-y-5">
        <motion.div animate={shake === 'name' ? { x: [0, -8, 8, -4, 0] } : {}} transition={{ duration: 0.3 }}>
          <label htmlFor="bk-name" className="mb-1.5 block text-[13px] font-semibold text-deep-blue">
            Full name <span className="text-alert-red">*</span>
          </label>
          <input
            id="bk-name"
            type="text"
            autoComplete="name"
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={() => draft.name && validate('name', draft.name)}
            className={cn(field, errors.name && 'border-alert-red')}
            placeholder="Your name"
          />
          {errors.name && <p className="mt-1 text-xs text-alert-red">{errors.name}</p>}
        </motion.div>

        <motion.div animate={shake === 'email' ? { x: [0, -8, 8, -4, 0] } : {}} transition={{ duration: 0.3 }}>
          <label htmlFor="bk-email" className="mb-1.5 block text-[13px] font-semibold text-deep-blue">
            Email <span className="text-alert-red">*</span>
          </label>
          <input
            id="bk-email"
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(e) => update({ email: e.target.value })}
            onBlur={() => draft.email && validate('email', draft.email)}
            className={cn(field, errors.email && 'border-alert-red')}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-alert-red">{errors.email}</p>}
        </motion.div>

        <div>
          <label htmlFor="bk-phone" className="mb-1.5 block text-[13px] font-semibold text-deep-blue">
            Phone / WhatsApp <span className="font-normal text-text-body/60">(optional)</span>
          </label>
          <input
            id="bk-phone"
            type="tel"
            autoComplete="tel"
            value={draft.phone}
            onChange={(e) => update({ phone: e.target.value })}
            className={field}
            placeholder="+1 555 000 0000"
          />
          <p className="mt-1 text-xs text-text-body/60">International format works best.</p>
        </div>

        <div>
          <label htmlFor="bk-notes" className="mb-1.5 block text-[13px] font-semibold text-deep-blue">
            What would you like to focus on? <span className="font-normal text-text-body/60">(optional)</span>
          </label>
          <textarea
            id="bk-notes"
            rows={3}
            maxLength={500}
            value={draft.notes}
            onChange={(e) => update({ notes: e.target.value })}
            className={cn(field, 'resize-none')}
            placeholder="Anything on your mind…"
          />
          <p className="mt-1 text-right text-xs text-text-body/60">{draft.notes.length}/500</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FOCUS_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => addChip(c)}
                className="rounded-full bg-green-tint px-3 py-1.5 text-xs font-semibold text-fresh-green-600 transition-transform hover:bg-fresh-green hover:text-white active:scale-95"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <motion.div animate={shake === 'consent' ? { x: [0, -8, 8, -4, 0] } : {}} transition={{ duration: 0.3 }}>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={draft.consent}
              onChange={(e) => update({ consent: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-grey-line accent-fresh-green"
            />
            <span className="text-sm text-text-body">
              I agree to be contacted about this booking. <span className="text-alert-red">*</span>
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-alert-red">{errors.consent}</p>}
        </motion.div>
      </div>
    </div>
  )
}

/* ---------------- Step 4: Payment (mock) ---------------- */

function detectBrand(num: string): 'visa' | 'mc' | null {
  const d = num.replace(/\s/g, '')
  if (d.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(d)) return 'mc'
  return null
}

function StepPayment({
  draft,
  services,
  reference,
  onSuccess,
  pushToast,
}: {
  draft: BookingDraft
  services: Service[]
  reference: string
  onSuccess: (zoomJoinUrl?: string) => void
  pushToast: (msg: string) => void
}) {
  const service = services.find((s) => s.id === draft.serviceId)!
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardName, setCardName] = useState(draft.name)
  const [payError, setPayError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const brand = detectBrand(card)
  const cardDigits = card.replace(/\s/g, '')
  const valid =
    cardDigits.length === 16 &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) &&
    /^\d{3,4}$/.test(cvc) &&
    cardName.trim().length > 1

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    if (d.length <= 2) return d
    return `${d.slice(0, 2)}/${d.slice(2)}`
  }

  const pay = async () => {
    setPayError(null)
    setProcessing(true)
    try {
      const { data: result } = await payBooking({
        reference,
        cardLast4: cardDigits.slice(-4),
      })
      if (result.ok) {
        pushToast('Payment successful (demo)')
        onSuccess(result.zoomJoinUrl)
      } else {
        setPayError('Card declined — this is a demo, try 4242 4242 4242 4242.')
      }
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Payment failed — please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border-[1.5px] border-grey-line bg-white px-4 py-3.5 text-[15px] text-deep-blue transition-shadow focus:border-fresh-green focus:ring-[3px] focus:ring-green-tint focus:outline-none'

  return (
    <div>
      <h3 className="font-display text-[22px] font-medium text-deep-blue lg:text-[28px]">
        Payment
      </h3>

      {/* summary */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-soft-grey px-5 py-4">
        <div>
          <p className="text-[15px] font-semibold text-deep-blue">{service.name}</p>
          <p className="text-sm text-text-body">
            {draft.date ? formatDateLong(draft.date) : ''} · {draft.slot} · {service.minutes} min
          </p>
        </div>
        <p className="font-display text-2xl font-medium text-deep-blue">${service.price}</p>
      </div>

      <div className="mt-4 rounded-xl bg-green-tint px-4 py-3 text-sm text-fresh-green-600">
        Demo mode — use <strong>4242 4242 4242 4242</strong>, any future date, any CVC.
      </div>

      <AnimatePresence>
        {payError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl border border-alert-red/40 bg-alert-red/10 px-4 py-3 text-sm font-medium text-alert-red"
            role="alert"
          >
            {payError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="bk-card" className="mb-1.5 block text-[13px] font-semibold text-deep-blue">
            Card number
          </label>
          <div className="relative">
            <input
              id="bk-card"
              inputMode="numeric"
              value={card}
              onChange={(e) => setCard(formatCard(e.target.value))}
              placeholder="4242 4242 4242 4242"
              className={cn(inputCls, 'pr-14')}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wide text-text-body/50">
              {brand === 'visa' ? 'Visa' : brand === 'mc' ? 'Mastercard' : <CreditCard className="h-5 w-5" aria-hidden="true" />}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="bk-exp" className="mb-1.5 block text-[13px] font-semibold text-deep-blue">
              Expiry
            </label>
            <input
              id="bk-exp"
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="bk-cvc" className="mb-1.5 block text-[13px] font-semibold text-deep-blue">
              CVC
            </label>
            <input
              id="bk-cvc"
              inputMode="numeric"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor="bk-cname" className="mb-1.5 block text-[13px] font-semibold text-deep-blue">
            Name on card
          </label>
          <input
            id="bk-cname"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Name as printed"
            className={inputCls}
          />
        </div>
      </div>

      <button
        onClick={pay}
        disabled={!valid || processing}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-fresh-green py-4 text-[15px] font-semibold text-white transition-all hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Processing…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" aria-hidden="true" /> Pay ${service.price} · Secure checkout (demo)
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs text-text-body/60">
        Demo checkout — no real charge is made.
      </p>
    </div>
  )
}

/* ---------------- Step 5: Confirmation ---------------- */

function Confetti() {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pieces = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        x: (i / 11 - 0.5) * 320 + (i % 2 ? 24 : -24),
        y: -120 - (i % 4) * 40,
        r: (i * 53) % 360,
        color: i % 3 === 0 ? '#0F2E46' : i % 3 === 1 ? '#3FA46A' : '#2E8B57',
        delay: 0.3 + (i % 6) * 0.05,
      })),
    [],
  )
  if (reduced) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-2.5 w-2.5 rounded-[3px]"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, 220], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 1.8, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function StepConfirmation({
  draft,
  services,
  reference,
  zoomJoinUrl,
}: {
  draft: BookingDraft
  services: Service[]
  reference: string
  zoomJoinUrl: string | null
}) {
  const service = services.find((s) => s.id === draft.serviceId)!
  const firstName = draft.name.trim().split(' ')[0] || 'friend'
  const zoomUrl = zoomJoinUrl ?? 'https://zoom.us/j/000-000-0000'
  const zoomLabel = zoomUrl.replace(/^https?:\/\//, '').split('?')[0]
  const calOpts = {
    title: `${service.name} with Roja — Grow With Roja`,
    date: draft.date!,
    time: draft.slot!,
    minutes: service.minutes,
    details: `Zoom: ${zoomUrl} (activates 15 min before)\nBooking reference: ${reference}`,
  }

  return (
    <div className="relative text-center">
      <Confetti />

      {/* check draw */}
      <motion.svg
        viewBox="0 0 72 72"
        className="mx-auto h-20 w-20"
        aria-hidden="true"
      >
        <motion.circle
          cx="36"
          cy="36"
          r="32"
          fill="none"
          stroke="#3FA46A"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        <motion.path
          d="M22 37 L32 47 L51 27"
          fill="none"
          stroke="#3FA46A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: EASE }}
        />
      </motion.svg>

      <p className="mt-4 font-script text-2xl text-fresh-green-600">You did the brave thing.</p>
      <h3 className="mt-2 font-display text-[26px] font-medium text-deep-blue lg:text-[32px]">
        You're booked, {firstName}!
      </h3>

      {/* ticket card */}
      <div className="relative mx-auto mt-7 max-w-md text-left">
        <div
          className="rounded-t-[20px] border border-b-0 border-grey-line bg-white px-6 pt-6"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle at 8px 0, transparent 6px, #fff 6px)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-green-600">
            Booking confirmed
          </p>
          <p className="mt-2 text-[17px] font-semibold text-deep-blue">{service.name}</p>
        </div>
        <div className="rounded-b-[20px] border border-t-0 border-grey-line bg-white px-6 pb-6 shadow-card">
          <div className="space-y-2.5 border-t border-dashed border-grey-line pt-4 text-sm">
            <p className="flex justify-between gap-4">
              <span className="text-text-body">Date &amp; time</span>
              <span className="text-right font-semibold text-deep-blue">
                {draft.date ? formatDateLong(draft.date) : ''} · {draft.slot}
              </span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-text-body">Duration</span>
              <span className="font-semibold text-deep-blue">{service.minutes} min</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-text-body">Zoom link</span>
              <span className="text-right font-semibold text-deep-blue">
                {zoomLabel}
                <span className="block text-xs font-normal text-text-body/70">
                  link activates 15 min before
                </span>
              </span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-text-body">Booking reference</span>
              <span className="font-mono text-sm font-semibold text-deep-blue">{reference}</span>
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <a
              href={googleCalendarUrl(calOpts)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-fresh-green py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-fresh-green-600 active:scale-[0.97]"
            >
              Google Calendar
            </a>
            <button
              onClick={() => downloadIcs({ ...calOpts, reference })}
              className="rounded-full border-[1.5px] border-deep-blue py-2.5 text-sm font-semibold text-deep-blue transition-all hover:bg-deep-blue hover:text-white active:scale-[0.97]"
            >
              Apple (.ics)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-full border-[1.5px] border-deep-blue px-7 py-3 text-[15px] font-semibold text-deep-blue transition-all hover:bg-deep-blue hover:text-white active:scale-[0.97]"
        >
          Back to top
        </button>
        <a
          href="https://instagram.com/GrowWithRoja"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-fresh-green-600"
        >
          <span className="relative">
            Follow @GrowWithRoja on Instagram
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-fresh-green-600 transition-all duration-200 group-hover:w-full" />
          </span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}

/* ---------------- Main wizard ---------------- */

const EMPTY_DRAFT: BookingDraft = {
  step: 0,
  serviceId: null,
  date: null,
  slot: null,
  holdExpires: null,
  name: '',
  email: '',
  phone: '',
  notes: '',
  consent: false,
}

export default function Booking() {
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [holdLeft, setHoldLeft] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [reference, setReference] = useState<string | null>(null)
  const [zoomJoinUrl, setZoomJoinUrl] = useState<string | null>(null)
  const [detailErrors, setDetailErrors] = useState<{ name?: string; email?: string; consent?: string }>({})
  const [hint, setHint] = useState<string | null>(null)

  const [apiServices, setApiServices] = useState<ApiService[] | null>(null)
  useEffect(() => {
    fetchServices()
      .then((rows) => setApiServices(rows))
      .catch(() => setApiServices([]))
  }, [])
  const services = useMemo<Service[]>(
    () => (apiServices && apiServices.length > 0 ? apiServices.map(mapApiService) : SERVICES),
    [apiServices],
  )
  const [reserving, setReserving] = useState(false)

  const pushToast = useCallback((message: string) => {
    const id = ++toastId
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  // Restore draft on mount
  useEffect(() => {
    const d = loadDraft()
    if (!d) return
    if (d.holdExpires && d.holdExpires < Date.now()) {
      d.slot = null
      d.holdExpires = null
    }
    setDraft(d)
    setStep(d.step)
    pushToast(
      d.slot && d.holdExpires
        ? 'Welcome back — your slot is still held'
        : 'Welcome back — pick up where you left off',
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist draft
  useEffect(() => {
    if (confirmed) return
    saveDraft({ ...draft, step })
  }, [draft, step, confirmed])

  // Preselect via localStorage signal from other sections (e.g. help cards)
  useEffect(() => {
    try {
      const pre = localStorage.getItem('gwr-preselect-service')
      if (pre && (SERVICES.some((s) => s.id === pre) || /^(discovery|coaching|reclaim)/.test(pre))) {
        localStorage.removeItem('gwr-preselect-service')
        setDraft((d) => (d.serviceId ? d : { ...d, serviceId: pre }))
        pushToast('Program pre-selected')
      }
    } catch {
      /* ignore */
    }
  }, [pushToast])

  // Hold countdown
  useEffect(() => {
    if (!draft.holdExpires || confirmed) {
      setHoldLeft(null)
      return
    }
    const tick = () => {
      const left = draft.holdExpires! - Date.now()
      if (left <= 0) {
        setHoldLeft(null)
        setDraft((d) => ({ ...d, slot: null, holdExpires: null }))
        pushToast('Your held slot was released — pick a new time')
      } else {
        setHoldLeft(left)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [draft.holdExpires, confirmed, pushToast])

  const update = (patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch }))

  const service = services.find((s) => s.id === draft.serviceId)
  const isFree = service?.price === 0

  const selectSlot = (time: string) => {
    update({ slot: time, holdExpires: null })
  }

  const goTo = (n: number) => {
    setDirection(n > step ? 1 : -1)
    setStep(n)
  }

  const validateDetails = (): boolean => {
    const e: typeof detailErrors = {}
    if (!draft.name.trim()) e.name = 'Please enter your name.'
    if (!EMAIL_RE.test(draft.email)) e.email = 'Please enter a valid email address.'
    if (!draft.consent) e.consent = 'Please agree so Roja can contact you about this booking.'
    setDetailErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 0) {
      if (!draft.serviceId) {
        setHint('Please choose a service first')
        setTimeout(() => setHint(null), 2500)
        return
      }
      goTo(1)
    } else if (step === 1) {
      if (!draft.date || !draft.slot) {
        setHint(draft.date ? 'Please pick a time slot' : 'Please pick a date first')
        setTimeout(() => setHint(null), 2500)
        return
      }
      goTo(2)
    } else if (step === 2) {
      if (!validateDetails()) return
      submitDetails()
    }
  }

  const submitDetails = async () => {
    if (!draft.serviceId || !draft.date || !draft.slot) {
      setHint('Still loading services — please try again in a moment')
      setTimeout(() => setHint(null), 2500)
      return
    }
    setReserving(true)
    try {
      const { data: held } = await holdBooking({
        serviceId: draft.serviceId,
        date: draft.date,
        startTime: draft.slot,
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim() || undefined,
        notes: draft.notes.trim() || undefined,
      })
      setReference(held.reference)
      update({ holdExpires: Date.now() + held.holdMinutes * 60_000 })
      pushToast(`Slot held for ${held.holdMinutes}:00 minutes`)
      if (!held.requiresPayment) {
        pushToast("No payment needed — it's free")
        try {
          const { data: res } = await confirmFreeBooking({ reference: held.reference })
          finishBooking(res.zoomJoinUrl)
        } catch {
          finishBooking()
        }
      } else {
        goTo(3)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not reserve that slot — please try again.'
      setHint(msg)
      setTimeout(() => setHint(null), 4000)
      if (/no longer available/i.test(msg)) {
        update({ slot: null, holdExpires: null })
      }
    } finally {
      setReserving(false)
    }
  }

  const finishBooking = (zoom?: string) => {
    if (zoom) setZoomJoinUrl(zoom)
    setConfirmed(true)
    clearDraft()
    setDirection(1)
    setStep(4)
    setTimeout(() => pushToast(`Confirmation email sent to ${draft.email} (mock)`), 700)
  }

  const back = () => {
    if (step === 3 && isFree) goTo(2)
    else if (step > 0) goTo(step - 1)
  }

  const displayStep = confirmed ? 4 : step

  const ctaLabel =
    step === 0
      ? 'Choose a time'
      : step === 1
        ? 'Continue'
        : step === 2
          ? isFree
            ? 'Review booking'
            : 'Continue to payment'
          : ''

  return (
    <section id="book" aria-labelledby="book-heading" className="relative bg-soft-grey">
      {/* wave divider */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute -top-[59px] left-0 h-[60px] w-full text-soft-grey"
      >
        <path d="M0 60 C 360 0 1080 0 1440 60 L1440 60 L0 60 Z" fill="currentColor" />
      </svg>

      <div className="mx-auto max-w-site px-5 py-[72px] lg:px-10 lg:py-[120px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-green-600">
            Book a session
          </p>
          <h2
            id="book-heading"
            className="font-display-lg mt-3 font-display text-[32px] font-medium leading-[1.12] text-deep-blue lg:text-5xl"
          >
            Your next step is one click.
          </h2>
          <p className="mt-4 text-[17px] leading-[1.65] text-text-body">
            Pick a time that suits you. You'll get a Zoom link and a reminder — no account needed.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-[-4px] mt-12 sm:mx-auto sm:max-w-[960px]"
        >
          <div className="overflow-hidden rounded-[24px] bg-white shadow-card lg:flex">
            <div className="flex-1 lg:min-w-0">
              <ProgressHeader displayStep={displayStep} />
              <div aria-live="polite" className="sr-only">
                Step {displayStep + 1} of 5: {STEP_LABELS[displayStep]}
              </div>

              <div className="px-5 py-6 sm:px-8 sm:py-8">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={{ opacity: 0, x: 24 * direction }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 * direction }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    {step === 0 && (
                      <StepService
                        draft={draft}
                        services={services}
                        onSelect={(id) => update({ serviceId: id })}
                      />
                    )}
                    {step === 1 && (
                      <StepTime
                        draft={draft}
                        onPick={(iso) => update({ date: iso, slot: null, holdExpires: null })}
                        onSlot={selectSlot}
                      />
                    )}
                    {step === 2 && (
                      <StepDetails
                        draft={draft}
                        update={update}
                        errors={detailErrors}
                        setErrors={setDetailErrors}
                      />
                    )}
                    {step === 3 && reference && (
                      <StepPayment
                        draft={draft}
                        services={services}
                        reference={reference}
                        onSuccess={finishBooking}
                        pushToast={pushToast}
                      />
                    )}
                    {step === 4 && reference && (
                      <StepConfirmation
                        draft={draft}
                        services={services}
                        reference={reference}
                        zoomJoinUrl={zoomJoinUrl}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* CTA bar */}
              {step < 3 && (
                <div className="flex items-center justify-between gap-3 border-t border-grey-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
                  {step > 0 ? (
                    <button
                      onClick={back}
                      className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-text-body transition-colors hover:text-deep-blue"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex w-full flex-col items-end gap-1 sm:w-auto">
                    <motion.button
                      key={hint ?? 'cta'}
                      animate={hint ? { x: [0, -8, 8, -4, 0] } : {}}
                      transition={{ duration: 0.3 }}
                      onClick={next}
                      disabled={step === 2 && (reserving)}
                      className={cn(
                        'inline-flex w-full items-center justify-center gap-2 rounded-full bg-fresh-green px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.97] sm:w-auto',
                        ((step === 0 && !draft.serviceId) || (step === 1 && (!draft.date || !draft.slot))) &&
                          'opacity-60',
                        step === 2 && (reserving) &&
                          'cursor-wait opacity-70',
                      )}
                    >
                      {step === 2 && (reserving) ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Reserving…
                        </>
                      ) : (
                        <>
                          {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </motion.button>
                    {hint && <p className="text-xs font-medium text-alert-red">{hint}</p>}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="border-t border-grey-line px-5 py-4 sm:px-8">
                  <button
                    onClick={back}
                    className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-text-body transition-colors hover:text-deep-blue"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                  </button>
                </div>
              )}
            </div>

            <SummaryRail draft={draft} services={services} holdLeft={holdLeft} confirmed={confirmed} reference={reference} />
          </div>
        </motion.div>
      </div>

      {/* vine leaf ornament with gentle sway */}
      <motion.img
        src="/leaf-line.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-6 hidden h-28 w-28 opacity-20 lg:block"
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <ToastStack toasts={toasts} />
    </section>
  )
}
