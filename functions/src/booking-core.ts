import { FieldValue, Firestore, Timestamp } from "firebase-admin/firestore";

export const HOLD_MINUTES = 10;
export const BUFFER_MINUTES = 15;
export const MIN_NOTICE_HOURS = 12;

export interface SlotDoc {
  kind: "one_off" | "recurring";
  date?: string | null;
  weekday?: number | null;
  startTime: string;
  endTime: string;
  location?: string | null;
  note?: string | null;
  isActive: boolean;
}

export interface BlockedDoc {
  startDate: string;
  endDate: string;
  reason?: string | null;
}

export interface BookingDoc {
  reference: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  notes?: string | null;
  status: "held" | "confirmed" | "cancelled" | "rescheduled" | "completed";
  paymentStatus: "not_required" | "pending" | "paid" | "failed" | "refunded";
  paymentRef?: string | null;
  zoomJoinUrl?: string | null;
  holdExpiresAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ServiceDoc {
  slug: string;
  title: string;
  description?: string | null;
  durationMin: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

export function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
export function toTime(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}
export function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function weekdayOf(date: string): number {
  return new Date(date + "T00:00:00Z").getUTCDay();
}
export function makeReference(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GWR-${new Date().getFullYear()}-${rand}`;
}

/** Compute the public availability calendar for a month from admin-managed slots. */
export async function computeMonthAvailability(
  db: Firestore,
  year: number,
  month: number,
): Promise<{ date: string; times: { start: string; end: string; booked: boolean }[] }[]> {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = addDays(start, 42);

  const [slotsSnap, blocksSnap, bookedSnap] = await Promise.all([
    db.collection("availabilitySlots").where("isActive", "==", true).get(),
    db.collection("blockedDates").get(),
    db.collection("bookings").where("date", ">=", start).where("date", "<=", end).get(),
  ]);

  const slots = slotsSnap.docs.map((d) => d.data() as SlotDoc);
  const blocks = blocksSnap.docs.map((d) => d.data() as BlockedDoc);
  const now = Date.now();
  const activeBooked = bookedSnap.docs
    .map((d) => d.data() as BookingDoc)
    .filter(
      (b) =>
        b.status === "confirmed" ||
        (b.status === "held" && !!b.holdExpiresAt && b.holdExpiresAt.toMillis() > now),
    );

  const blockedOn = (date: string) =>
    blocks.some((b) => date >= b.startDate && date <= b.endDate);

  const days: { date: string; times: { start: string; end: string; booked: boolean }[] }[] = [];
  for (let i = 0; i < 31; i++) {
    const date = addDays(start, i);
    if (!date.startsWith(start.slice(0, 7))) break;
    if (blockedOn(date)) continue;
    const wd = weekdayOf(date);
    if (wd === 0 || wd === 6) continue; // weekends unavailable by default
    const daySlots = slots.filter((s) =>
      s.kind === "one_off" ? s.date === date : s.weekday === wd,
    );
    const times = daySlots
      .map((s) => ({
        start: s.startTime,
        end: s.endTime,
        booked: activeBooked.some(
          (b) =>
            b.date === date &&
            toMin(b.startTime) < toMin(s.endTime) + BUFFER_MINUTES &&
            toMin(s.startTime) < toMin(b.endTime) + BUFFER_MINUTES,
        ),
      }))
      .sort((a, b) => a.start.localeCompare(b.start));
    if (times.length) days.push({ date, times });
  }
  return days;
}

export async function getBookingByRef(
  db: Firestore,
  reference: string,
): Promise<{ id: string; data: BookingDoc } | null> {
  const snap = await db
    .collection("bookings")
    .where("reference", "==", reference)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, data: doc.data() as BookingDoc };
}

export async function getServiceById(
  db: Firestore,
  serviceId: string,
): Promise<ServiceDoc | null> {
  const doc = await db.collection("services").doc(serviceId).get();
  return doc.exists ? (doc.data() as ServiceDoc) : null;
}

export { FieldValue, Timestamp };
