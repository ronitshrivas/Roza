/**
 * Seed the Firestore data model with initial services, availability and settings.
 *
 * Usage:
 *   1. cp .env.local.example .env.local and fill in the FIREBASE_* Admin SDK vars
 *      (or set FIREBASE_SERVICE_ACCOUNT_JSON).
 *   2. npm run seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function buildCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) return cert(JSON.parse(json));
  return cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });
}

const app = getApps().length ? getApps()[0] : initializeApp({ credential: buildCredential() });
const db = getFirestore(app);

const SERVICES = [
  {
    id: "discovery",
    slug: "discovery",
    title: "Discovery Call",
    description: "A relaxed first conversation. See if we're a fit, ask anything.",
    durationMin: 20,
    priceCents: 0,
    currency: "AUD",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "coaching",
    slug: "coaching",
    title: "1:1 Coaching Session",
    description: "Focused deep work on one challenge — leave with clarity and a practice.",
    durationMin: 60,
    priceCents: 12000,
    currency: "AUD",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "reclaim",
    slug: "reclaim",
    title: "Reclaim Your Power — 4-Week Program",
    description: "The full journey: See → Release → Rewire → Anchor. 4 sessions + support.",
    durationMin: 60,
    priceCents: 68000,
    currency: "AUD",
    isActive: true,
    sortOrder: 3,
  },
];

// Default weekly availability: Tue/Wed/Thu, three 60-min slots each day.
const RECURRING_SLOTS = [2, 3, 4].flatMap((weekday) =>
  ["09:00", "11:00", "14:00"].map((startTime) => ({
    kind: "recurring" as const,
    date: null,
    weekday,
    startTime,
    endTime: `${String(Number(startTime.slice(0, 2)) + 1).padStart(2, "0")}:00`,
    location: "Online (Zoom)",
    note: null,
    isActive: true,
  })),
);

async function main() {
  const batch = db.batch();

  for (const s of SERVICES) {
    const { id, ...data } = s;
    batch.set(db.collection("services").doc(id), data, { merge: true });
  }

  for (const slot of RECURRING_SLOTS) {
    batch.set(db.collection("availabilitySlots").doc(), {
      ...slot,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  batch.set(
    db.collection("settings").doc("site"),
    {
      businessName: "Grow With Roja",
      email: "hello@growwithroja.com",
      instagram: "@GrowWithRoja",
      timezone: "Australia/Sydney",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
  console.log(
    `Seeded ${SERVICES.length} services, ${RECURRING_SLOTS.length} availability slots and site settings.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
