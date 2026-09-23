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
 * present. When a developer clones the repo without their own .env.local, or
 * during SSR / build, `functions` and `db` are null. Rather than crashing the
 * page on mount, read-style calls return empty results and write-style calls
 * throw a friendly error only when the user actually triggers them.
 */
export const isFirebaseConfigured = () => Boolean(db && functions);

const NOT_CONFIGURED_MESSAGE =
  "Booking is currently unavailable. Please try again later or reach out via the contact section.";

function requireFunctions(): Functions {
  if (!functions) throw new Error(NOT_CONFIGURED_MESSAGE);
  return functions;
}

function requireDb(): Firestore {
  if (!db) throw new Error(NOT_CONFIGURED_MESSAGE);
  return db;
}

/**
 * Public read of active services. Returns [] when Firebase isn't configured
 * so the page can render without crashing on mount.
 */
export async function fetchServices(): Promise<ApiService[]> {
  if (!isFirebaseConfigured()) return [];
  const snap = await getDocs(
    query(collection(requireDb(), "services"), where("isActive", "==", true)),
  );
  const rows = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ApiService, "id">),
  }));
  return rows.sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Callable-style wrappers. Reads (`getAvailability`) resolve to empty data
 * when Firebase is missing; writes reject with a clear error so the UI can
 * surface it after the user acts, not on page load.
 */
function callableRead<Req, Res>(name: string, emptyValue: Res) {
  return async (data: Req): Promise<{ data: Res }> => {
    if (!isFirebaseConfigured()) return { data: emptyValue };
    return httpsCallable<Req, Res>(requireFunctions(), name)(data);
  };
}

function callableWrite<Req, Res>(name: string) {
  return (data: Req) => httpsCallable<Req, Res>(requireFunctions(), name)(data);
}

export const getAvailability = callableRead<
  { year: number; month: number },
  AvailabilityDay[]
>("getAvailability", []);

export const holdBooking = callableWrite<
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

export const payBooking = callableWrite<
  { reference: string; cardLast4: string },
  PayResult
>("payBooking");

export const confirmFreeBooking = callableWrite<{ reference: string }, PayResult>(
  "confirmFreeBooking",
);

export const cancelBooking = callableWrite<
  { reference: string; email: string },
  { ok: boolean }
>("cancelBooking");
