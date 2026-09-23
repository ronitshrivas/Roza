import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import {
  BookingDoc,
  FieldValue,
  HOLD_MINUTES,
  MIN_NOTICE_HOURS,
  Timestamp,
  computeMonthAvailability,
  getBookingByRef,
  getServiceById,
  makeReference,
  toMin,
  toTime,
} from "./booking-core";
import { createZoomMeeting, processPayment, sendBookingEmails } from "./external";

initializeApp();
const db = getFirestore();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/* ------------------------------------------------------------------ */
/* Public client booking experience                                    */
/* ------------------------------------------------------------------ */

export const getAvailability = onCall<{ year: number; month: number }>(async (req) => {
  const { year, month } = req.data ?? {};
  if (
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    typeof month !== "number" ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new HttpsError("invalid-argument", "Expected { year: number, month: 1-12 }");
  }
  return computeMonthAvailability(db, year, month);
});

export const holdBooking = onCall<{
  serviceId: string;
  date: string;
  startTime: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}>(async (req) => {
  const input = req.data;
  if (
    !input ||
    typeof input.serviceId !== "string" ||
    !DATE_RE.test(input.date ?? "") ||
    !TIME_RE.test(input.startTime ?? "") ||
    typeof input.name !== "string" ||
    input.name.trim().length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email ?? "")
  ) {
    throw new HttpsError("invalid-argument", "Invalid booking details");
  }
  if (input.notes && input.notes.length > 500) {
    throw new HttpsError("invalid-argument", "Notes are limited to 500 characters");
  }

  const service = await getServiceById(db, input.serviceId);
  if (!service) throw new HttpsError("not-found", "Service not found");

  // Minimum booking notice
  const startTs = new Date(`${input.date}T${input.startTime}:00Z`).getTime();
  if (startTs - Date.now() < MIN_NOTICE_HOURS * 3600_000) {
    throw new HttpsError(
      "failed-precondition",
      "This slot is inside the minimum booking notice window",
    );
  }

  // Verify slot is actually available (inside a transaction-safe re-check)
  const [y, m] = input.date.split("-").map(Number);
  const days = await computeMonthAvailability(db, y, m);
  const day = days.find((d) => d.date === input.date);
  const slot = day?.times.find((t) => t.start === input.startTime);
  if (!slot || slot.booked) {
    throw new HttpsError("already-exists", "This time slot is no longer available");
  }

  const reference = makeReference();
  const endTime = toTime(toMin(input.startTime) + service.durationMin);
  const free = service.priceCents === 0;

  const doc: Omit<BookingDoc, "createdAt" | "updatedAt"> & {
    createdAt: FirebaseFirestore.FieldValue;
    updatedAt: FirebaseFirestore.FieldValue;
  } = {
    reference,
    serviceId: input.serviceId,
    date: input.date,
    startTime: input.startTime,
    endTime,
    clientName: input.name.trim(),
    clientEmail: input.email.trim(),
    clientPhone: input.phone ?? null,
    notes: input.notes ?? null,
    status: "held",
    paymentStatus: free ? "not_required" : "pending",
    paymentRef: null,
    zoomJoinUrl: null,
    holdExpiresAt: Timestamp.fromMillis(Date.now() + HOLD_MINUTES * 60_000),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const ref = await db.collection("bookings").add(doc);
  return { id: ref.id, reference, endTime, requiresPayment: !free, holdMinutes: HOLD_MINUTES };
});

export const payBooking = onCall<{ reference: string; cardLast4: string }>(async (req) => {
  const { reference, cardLast4 } = req.data ?? {};
  if (typeof reference !== "string" || !/^\d{4}$/.test(cardLast4 ?? "")) {
    throw new HttpsError("invalid-argument", "Expected { reference, cardLast4 (4 digits) }");
  }
  const b = await getBookingByRef(db, reference);
  if (!b) throw new HttpsError("not-found", "Booking not found");
  if (b.data.status !== "held") {
    throw new HttpsError("failed-precondition", "Booking is not awaiting payment");
  }
  if (b.data.holdExpiresAt && b.data.holdExpiresAt.toMillis() < Date.now()) {
    await db.collection("bookings").doc(b.id).update({
      status: "cancelled",
      paymentStatus: "failed",
      updatedAt: FieldValue.serverTimestamp(),
    });
    throw new HttpsError(
      "failed-precondition",
      "The slot hold expired - please choose the time again",
    );
  }

  const service = await getServiceById(db, b.data.serviceId);
  const result = await processPayment(
    cardLast4,
    service?.priceCents ?? 0,
    service?.currency ?? "AUD",
  );
  if (!result.ok) {
    await db.collection("bookings").doc(b.id).update({
      paymentStatus: "failed",
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: false };
  }
  const zoom = await createZoomMeeting(service?.title ?? "Coaching Session", b.data.date, b.data.startTime);
  await db.collection("bookings").doc(b.id).update({
    status: "confirmed",
    paymentStatus: "paid",
    paymentRef: result.ref ?? null,
    zoomJoinUrl: zoom,
    holdExpiresAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await sendBookingEmails("confirmation", reference);
  await sendBookingEmails("admin", reference);
  return { ok: true, reference, zoomJoinUrl: zoom };
});

export const confirmFreeBooking = onCall<{ reference: string }>(async (req) => {
  const reference = req.data?.reference;
  if (typeof reference !== "string") {
    throw new HttpsError("invalid-argument", "Expected { reference }");
  }
  const b = await getBookingByRef(db, reference);
  if (!b) throw new HttpsError("not-found", "Booking not found");
  const zoom = await createZoomMeeting("Discovery Call", b.data.date, b.data.startTime);
  await db.collection("bookings").doc(b.id).update({
    status: "confirmed",
    zoomJoinUrl: zoom,
    holdExpiresAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await sendBookingEmails("confirmation", reference);
  return { ok: true, reference, zoomJoinUrl: zoom };
});

export const cancelBooking = onCall<{ reference: string; email: string }>(async (req) => {
  const { reference, email } = req.data ?? {};
  if (typeof reference !== "string" || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "Expected { reference, email }");
  }
  const b = await getBookingByRef(db, reference);
  if (!b || b.data.clientEmail.toLowerCase() !== email.toLowerCase()) {
    throw new HttpsError("not-found", "Booking not found");
  }
  await db.collection("bookings").doc(b.id).update({
    status: "cancelled",
    updatedAt: FieldValue.serverTimestamp(),
  });
  await sendBookingEmails("cancelled", reference);
  return { ok: true };
});

/* ------------------------------------------------------------------ */
/* Admin setup                                                          */
/* ------------------------------------------------------------------ */

/**
 * One-time setup helper: grants the `admin: true` custom claim to a user.
 * Protected by the SETUP_SECRET env var - call once from a trusted shell,
 * then rotate/remove the secret. See README.
 */
export const setAdminClaim = onCall<{ email: string; secret: string }>(async (req) => {
  const { email, secret } = req.data ?? {};
  const expected = process.env.SETUP_SECRET;
  if (!expected) {
    throw new HttpsError("failed-precondition", "SETUP_SECRET is not configured");
  }
  if (typeof email !== "string" || secret !== expected) {
    throw new HttpsError("permission-denied", "Invalid credentials");
  }
  const user = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, { admin: true });
  return { ok: true, uid: user.uid };
});
