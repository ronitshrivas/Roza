'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarOff,
  Clock,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const BOOKING_STATUSES = ['held', 'confirmed', 'cancelled', 'rescheduled', 'completed'] as const

const inputCls =
  'w-full rounded-xl border-[1.5px] border-grey-line bg-white px-3.5 py-2.5 text-sm text-deep-blue transition-shadow focus:border-fresh-green focus:ring-[3px] focus:ring-green-tint focus:outline-none'

interface SlotRow {
  id: string
  kind: 'one_off' | 'recurring'
  date?: string | null
  weekday?: number | null
  startTime: string
  endTime: string
  location?: string | null
  note?: string | null
  isActive: boolean
}

interface BlockedRow {
  id: string
  startDate: string
  endDate: string
  reason?: string | null
}

interface BookingRow {
  id: string
  reference: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  status: string
  paymentStatus: string
}

interface ServiceRow {
  id: string
  title: string
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft-grey">
      <header className="border-b border-grey-line bg-white">
        <div className="mx-auto flex max-w-site items-center justify-between px-5 py-4 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-body transition-colors hover:text-deep-blue"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to site
          </Link>
          <p className="font-display text-lg font-medium text-deep-blue">
            Grow With Roja <span className="text-fresh-green-600">· Coach admin</span>
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-site px-5 py-10 lg:px-10">{children}</main>
    </div>
  )
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-[24px] border border-grey-line bg-white p-8 text-center shadow-card">
      {children}
    </div>
  )
}

/* ---------------- Availability tab ---------------- */

function AvailabilityTab() {
  const [slots, setSlots] = useState<SlotRow[] | null>(null)
  const [kind, setKind] = useState<'recurring' | 'one_off'>('recurring')
  const [weekday, setWeekday] = useState(2)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [location, setLocation] = useState('Online (Zoom)')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return onSnapshot(collection(db, 'availabilitySlots'), (snap) => {
      setSlots(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SlotRow, 'id'>) })))
    })
  }, [])

  const recurring = (slots ?? []).filter((s) => s.kind === 'recurring')
  const oneOff = (slots ?? []).filter((s) => s.kind === 'one_off')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await addDoc(collection(db, 'availabilitySlots'), {
        kind,
        date: kind === 'one_off' ? date : null,
        weekday: kind === 'recurring' ? weekday : null,
        startTime,
        endTime,
        location: location || 'Online (Zoom)',
        note: note || null,
        isActive: true,
      })
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add slot')
    } finally {
      setSaving(false)
    }
  }

  const renderSlot = (s: SlotRow) => (
    <li
      key={s.id}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-grey-line bg-white px-4 py-3"
    >
      <Clock className="h-4 w-4 shrink-0 text-fresh-green-600" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-deep-blue">
          {s.kind === 'recurring' ? `Every ${WEEKDAYS[s.weekday ?? 0]}` : s.date} · {s.startTime}–{s.endTime}
        </p>
        <p className="text-xs text-text-body/80">
          {s.location ?? 'Online (Zoom)'}
          {s.note ? ` · ${s.note}` : ''}
        </p>
      </div>
      <button
        onClick={() => updateDoc(doc(db, 'availabilitySlots', s.id), { isActive: !s.isActive })}
        className={cn(
          'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
          s.isActive
            ? 'bg-green-tint text-fresh-green-600 hover:bg-fresh-green hover:text-white'
            : 'bg-soft-grey text-text-body/60 hover:bg-grey-line',
        )}
      >
        {s.isActive ? 'Active' : 'Inactive'}
      </button>
      <button
        onClick={() => deleteDoc(doc(db, 'availabilitySlots', s.id))}
        aria-label="Delete slot"
        className="rounded-full p-1.5 text-text-body/50 transition-colors hover:bg-alert-red/10 hover:text-alert-red"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section>
          <h3 className="font-display text-lg font-medium text-deep-blue">Recurring weekly slots</h3>
          {slots === null ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-text-body">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
            </p>
          ) : recurring.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-grey-line p-4 text-sm text-text-body/70">
              No recurring slots yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">{recurring.map(renderSlot)}</ul>
          )}
        </section>
        <section>
          <h3 className="font-display text-lg font-medium text-deep-blue">One-off slots</h3>
          {oneOff.length === 0 && slots !== null ? (
            <p className="mt-3 rounded-2xl border border-dashed border-grey-line p-4 text-sm text-text-body/70">
              No one-off slots yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">{oneOff.map(renderSlot)}</ul>
          )}
        </section>
      </div>

      <form onSubmit={submit} className="h-fit rounded-[24px] border border-grey-line bg-white p-6 shadow-card">
        <h3 className="font-display text-lg font-medium text-deep-blue">Add a slot</h3>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(['recurring', 'one_off'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'rounded-full border-[1.5px] px-3 py-2 text-sm font-semibold transition-colors',
                kind === k
                  ? 'border-fresh-green bg-green-tint text-fresh-green-600'
                  : 'border-grey-line text-text-body hover:border-fresh-green/50',
              )}
            >
              {k === 'recurring' ? 'Recurring' : 'One-off'}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {kind === 'recurring' ? (
            <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className={inputCls}>
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          ) : (
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
            <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g. Online (Zoom))"
            className={inputCls}
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className={inputCls}
          />
        </div>
        {error && <p className="mt-3 text-xs font-medium text-alert-red">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-fresh-green py-3 text-sm font-semibold text-white transition-all hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          Add slot
        </button>
      </form>
    </div>
  )
}

/* ---------------- Bookings tab ---------------- */

function BookingsTab() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null)
  const [services, setServices] = useState<ServiceRow[]>([])

  useEffect(() => {
    const unsubBookings = onSnapshot(
      query(collection(db, 'bookings'), orderBy('date')),
      (snap) =>
        setBookings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookingRow, 'id'>) }))),
    )
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) =>
      setServices(snap.docs.map((d) => ({ id: d.id, title: d.data().title as string }))),
    )
    return () => {
      unsubBookings()
      unsubServices()
    }
  }, [])

  const serviceTitle = (id: string) => services.find((s) => s.id === id)?.title ?? `Service ${id}`

  const statusColor: Record<string, string> = {
    held: 'bg-warm-gold/15 text-warm-gold',
    confirmed: 'bg-green-tint text-fresh-green-600',
    cancelled: 'bg-alert-red/10 text-alert-red',
    rescheduled: 'bg-blue-tint text-deep-blue-600',
    completed: 'bg-soft-grey text-text-body',
  }

  return (
    <div>
      {bookings === null ? (
        <p className="flex items-center gap-2 text-sm text-text-body">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading bookings…
        </p>
      ) : !bookings.length ? (
        <p className="rounded-2xl border border-dashed border-grey-line bg-white p-6 text-center text-sm text-text-body/70">
          No bookings yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[24px] border border-grey-line bg-white shadow-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-grey-line text-xs font-bold uppercase tracking-wide text-text-body/60">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Date &amp; time</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-grey-line/60 last:border-0 hover:bg-soft-grey/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-deep-blue">{b.reference}</td>
                  <td className="px-4 py-3 text-text-body">
                    {b.date} · {b.startTime}–{b.endTime}
                  </td>
                  <td className="px-4 py-3 text-deep-blue">{serviceTitle(b.serviceId)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-deep-blue">{b.clientName}</p>
                    <p className="text-xs text-text-body/80">{b.clientEmail}</p>
                    {b.clientPhone && <p className="text-xs text-text-body/80">{b.clientPhone}</p>}
                  </td>
                  <td className="px-4 py-3 text-text-body">{b.paymentStatus.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        updateDoc(doc(db, 'bookings', b.id), { status: e.target.value })
                      }
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-semibold focus:outline-none',
                        statusColor[b.status] ?? 'bg-soft-grey text-text-body',
                      )}
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ---------------- Blocked dates tab ---------------- */

function BlockedTab() {
  const [blocked, setBlocked] = useState<BlockedRow[] | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return onSnapshot(collection(db, 'blockedDates'), (snap) =>
      setBlocked(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlockedRow, 'id'>) }))),
    )
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await addDoc(collection(db, 'blockedDates'), {
        startDate,
        endDate,
        reason: reason || null,
      })
      setStartDate('')
      setEndDate('')
      setReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not block dates')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section>
        <h3 className="font-display text-lg font-medium text-deep-blue">Blocked ranges</h3>
        {blocked === null ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-text-body">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
          </p>
        ) : !blocked.length ? (
          <p className="mt-3 rounded-2xl border border-dashed border-grey-line bg-white p-4 text-sm text-text-body/70">
            No blocked dates - every slot is bookable.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {blocked.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-grey-line bg-white px-4 py-3"
              >
                <CalendarOff className="h-4 w-4 shrink-0 text-alert-red" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-deep-blue">
                    {r.startDate} → {r.endDate}
                  </p>
                  {r.reason && <p className="text-xs text-text-body/80">{r.reason}</p>}
                </div>
                <button
                  onClick={() => deleteDoc(doc(db, 'blockedDates', r.id))}
                  aria-label="Delete blocked range"
                  className="rounded-full p-1.5 text-text-body/50 transition-colors hover:bg-alert-red/10 hover:text-alert-red"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={submit} className="h-fit rounded-[24px] border border-grey-line bg-white p-6 shadow-card">
        <h3 className="font-display text-lg font-medium text-deep-blue">Block dates</h3>
        <div className="mt-4 space-y-3">
          <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
          <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional, e.g. Holiday)"
            className={inputCls}
          />
        </div>
        {error && <p className="mt-3 text-xs font-medium text-alert-red">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-fresh-green py-3 text-sm font-semibold text-white transition-all hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          Block range
        </button>
      </form>
    </div>
  )
}

/* ---------------- Sign-in ---------------- */

function SignInCard() {
  const { signInWithGoogle, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <CenteredCard>
      <LogIn className="mx-auto h-10 w-10 text-fresh-green" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-medium text-deep-blue">Coach sign-in required</h1>
      <p className="mt-2 text-sm text-text-body">
        This area is for Roja. Please sign in to manage availability and bookings.
      </p>
      <button
        onClick={() => run(signInWithGoogle)}
        disabled={busy}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-fresh-green px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-fresh-green-600 hover:shadow-cta-glow active:scale-[0.98] disabled:opacity-50"
      >
        Sign in with Google
      </button>
      <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-text-body/50">
        <span className="h-px flex-1 bg-grey-line" /> or <span className="h-px flex-1 bg-grey-line" />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          run(() => signInWithEmail(email, password))
        }}
        className="space-y-3"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputCls}
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputCls}
        />
        {error && <p className="text-xs font-medium text-alert-red">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-deep-blue px-7 py-3 text-sm font-semibold text-deep-blue transition-all hover:bg-deep-blue hover:text-white active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Sign in with email
        </button>
      </form>
    </CenteredCard>
  )
}

/* ---------------- Page ---------------- */

const TABS = [
  { id: 'availability', label: 'Availability', icon: Clock },
  { id: 'bookings', label: 'Bookings', icon: Users },
  { id: 'blocked', label: 'Blocked dates', icon: CalendarOff },
] as const

type TabId = (typeof TABS)[number]['id']

export default function AdminPage() {
  const { user, isAdmin, isLoading, isAuthenticated, signOut } = useAuth()
  const [tab, setTab] = useState<TabId>('availability')

  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center gap-2 py-24 text-text-body">
          <Loader2 className="h-5 w-5 animate-spin text-fresh-green" aria-hidden="true" /> Loading…
        </div>
      </Shell>
    )
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <SignInCard />
      </Shell>
    )
  }

  if (!isAdmin) {
    return (
      <Shell>
        <CenteredCard>
          <Lock className="mx-auto h-10 w-10 text-warm-gold" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-medium text-deep-blue">Access restricted</h1>
          <p className="mt-2 text-sm text-text-body">
            You're signed in as {user?.displayName ?? user?.email ?? 'a visitor'}, but this dashboard
            is only available to the coach account.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-deep-blue px-7 py-3 text-sm font-semibold text-deep-blue transition-all hover:bg-deep-blue hover:text-white active:scale-[0.98]"
            >
              Back to site
            </Link>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-body transition-colors hover:text-deep-blue"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          </div>
        </CenteredCard>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border-[1.5px] px-5 py-2.5 text-sm font-semibold transition-colors',
              tab === t.id
                ? 'border-fresh-green bg-fresh-green text-white shadow-card'
                : 'border-grey-line bg-white text-text-body hover:border-fresh-green/60 hover:text-deep-blue',
            )}
          >
            <t.icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </button>
        ))}
        <button
          onClick={() => signOut()}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-grey-line bg-white px-5 py-2.5 text-sm font-semibold text-text-body transition-colors hover:text-deep-blue"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
        </button>
      </div>
      <div className="mt-8">
        {tab === 'availability' && <AvailabilityTab />}
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'blocked' && <BlockedTab />}
      </div>
    </Shell>
  )
}
