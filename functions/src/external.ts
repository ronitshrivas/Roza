import Stripe from "stripe";
import nodemailer from "nodemailer";

/**
 * External-service integrations. Real credentials arrive with the client
 * handover; until then each falls back to a realistic mock so the full
 * workflow is testable end-to-end.
 */

export async function processPayment(
  cardLast4: string,
  amountCents: number,
  currency: string,
): Promise<{ ok: boolean; ref?: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Mock gateway: 0002 = decline (mirrors Stripe test cards)
    if (cardLast4 === "0002") return { ok: false };
    return { ok: true, ref: `pi_mock_${Date.now()}` };
  }
  // Stripe test mode: create a PaymentIntent for the held booking.
  // The demo checkout collects card details client-side only for UX parity;
  // a production handover would confirm via Stripe.js/Checkout instead.
  if (cardLast4 === "0002") return { ok: false };
  const stripe = new Stripe(key);
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: { source: "grow-with-roja-booking" },
  });
  return { ok: true, ref: intent.id };
}

export async function createZoomMeeting(
  topic: string,
  date: string,
  startTime: string,
): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) {
    return `https://zoom.us/j/mock-${Math.floor(Math.random() * 1e10)}?topic=${encodeURIComponent(topic)}`;
  }
  // Zoom Server-to-Server OAuth meeting creation.
  const tokenRes = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
    },
  );
  const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string };
  const meetingRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      topic,
      type: 2,
      start_time: `${date}T${startTime}:00`,
      timezone: "UTC",
      settings: { join_before_host: true, waiting_room: false },
    }),
  });
  const meeting = (await meetingRes.json()) as { join_url?: string };
  return meeting.join_url ?? `https://zoom.us/j/pending?topic=${encodeURIComponent(topic)}`;
}

export async function sendBookingEmails(
  kind: "confirmation" | "admin" | "cancelled",
  ref: string,
): Promise<{ queued: boolean }> {
  const smtpUrl = process.env.SMTP_URL;
  if (!smtpUrl) return { queued: false };
  const to =
    kind === "admin"
      ? (process.env.ADMIN_EMAIL ?? "hello@growwithroja.com")
      : (process.env.BOOKING_CLIENT_EMAIL ?? process.env.ADMIN_EMAIL ?? "");
  if (!to) return { queued: false };
  const transporter = nodemailer.createTransport(smtpUrl);
  const subjects: Record<string, string> = {
    confirmation: `Your booking is confirmed (${ref})`,
    admin: `New booking ${ref}`,
    cancelled: `Booking ${ref} cancelled`,
  };
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "Grow With Roja <hello@growwithroja.com>",
    to,
    subject: subjects[kind],
    text: `Booking reference: ${ref}\nStatus: ${kind}\n`,
  });
  return { queued: true };
}
