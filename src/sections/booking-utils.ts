export interface Service {
  id: string
  name: string
  minutes: number
  price: number
  blurb: string
  chip?: string
  chipGold?: boolean
}

export const SERVICES: Service[] = [
  {
    id: 'discovery',
    name: 'Discovery Call',
    minutes: 20,
    price: 0,
    blurb: "A relaxed first conversation. See if we're a fit, ask anything.",
    chip: 'FREE',
  },
  {
    id: 'coaching',
    name: '1:1 Coaching Session',
    minutes: 60,
    price: 120,
    blurb: 'Focused deep work on one challenge — leave with clarity and a practice.',
  },
  {
    id: 'reclaim',
    name: 'Reclaim Your Power — 4-Week Program',
    minutes: 60,
    price: 680,
    blurb: 'The full journey: See → Release → Rewire → Anchor. 4 sessions + support.',
    chip: 'Signature',
    chipGold: true,
  },
]

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateLong(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export const DRAFT_KEY = 'gwr-booking-draft'

export interface BookingDraft {
  step: number
  serviceId: string | null
  date: string | null
  slot: string | null
  holdExpires: number | null
  name: string
  email: string
  phone: string
  notes: string
  consent: boolean
}

export function loadDraft(): BookingDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as BookingDraft
    if (typeof d.step !== 'number' || d.step <= 0 || d.step >= 4) return null
    return d
  } catch {
    return null
  }
}

export function saveDraft(d: BookingDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
  } catch {
    /* ignore */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* ignore */
  }
}

export function googleCalendarUrl(opts: {
  title: string
  date: string
  time: string
  minutes: number
  details: string
}): string {
  const start = new Date(`${opts.date}T${opts.time}:00`)
  const end = new Date(start.getTime() + opts.minutes * 60000)
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: opts.details,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcs(opts: {
  title: string
  date: string
  time: string
  minutes: number
  details: string
  reference: string
}) {
  const start = new Date(`${opts.date}T${opts.time}:00`)
  const end = new Date(start.getTime() + opts.minutes * 60000)
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grow With Roja//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${opts.reference}@growwithroja.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.details.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${opts.reference}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
