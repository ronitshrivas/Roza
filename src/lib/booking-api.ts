"use client";

import { httpsCallable, type Functions } from "firebase/functions";
import { collection, getDocs, query, where, type Firestore } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";

export interface ApiService {
  id: string; // slug, e.g. "discovery"
  slug: string;
  title: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AvailabilityDay {
  date: string;
  times: { start: string; end: string; booked: boolean }[];
}

export interface HoldResult {
  id: string;
  reference: string;
  endTime: string;
  requiresPayment: boolean;
  holdMinutes: number;
}

export interface PayResult {
  ok: boolean;
  reference?: string;
  zoomJoinUrl?: string;
}

/**
 * Firebase is only initialised in the browser when valid config env vars are
 * present. During SSR, at build time, or in a misconfigured local setup the
 * `functions` and `db` exports may be null, so every API call goes through
 * these guards instead of touching the SDK at module scope.
 */
function requireFunctions(): Functions {
  if (!functions) {
    throw new Error(
      "Firebase is not configured. Add your Firebase credentials to .env.local to enable bookings.",
    );
  }
  return functions;
}

function requireDb(): Firestore {
  if (!db) {
    throw new Error(
      "Firebase is not configured. Add your Firebase credentials to .env.local to enable bookings.",
    );
  }
  return db;
}

/** Public read of active services straight from Firestore (allowed by rules). */
export async function fetchServices(): Promise<ApiService[]> {
  const snap = await getDocs(
    query(collection(requireDb(), "services"), where("isActive", "==", true)),
  );
  const rows = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ApiService, "id">),
  }));
  return rows.sort((a, b) => a.sortOrder - b.sortOrder);
}

// Callables are wrapped so `httpsCallable` runs at call time, not on import.
// If we ran it at import time and `functions` was null, the whole page would
// crash with "null is not an object (evaluating 'functionsInstance._url')".
function call<Req, Res>(name: string) {
  return (data: Req) => httpsCallable<Req, Res>(requireFunctions(), name)(data);
}

export const getAvailability = call<{ year: number; month: number }, AvailabilityDay[]>(
  "getAvailability",
);

export const holdBooking = call<
  {
    serviceId: string;
    date: string;
    startTime: string;
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  },
  HoldResult
>("holdBooking");

export const payBooking = call<{ reference: string; cardLast4: string }, PayResult>(
  "payBooking",
);

export const confirmFreeBooking = call<{ reference: string }, PayResult>(
  "confirmFreeBooking",
);

export const cancelBooking = call<{ reference: string; email: string }, { ok: boolean }>(
  "cancelBooking",
);
