"use client";

import { httpsCallable } from "firebase/functions";
import { collection, getDocs, query, where } from "firebase/firestore";
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

/** Public read of active services straight from Firestore (allowed by rules). */
export async function fetchServices(): Promise<ApiService[]> {
  const snap = await getDocs(query(collection(db, "services"), where("isActive", "==", true)));
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ApiService, "id">) }));
  return rows.sort((a, b) => a.sortOrder - b.sortOrder);
}

const callable = <Req, Res>(name: string) => httpsCallable<Req, Res>(functions, name);

export const getAvailability = callable<{ year: number; month: number }, AvailabilityDay[]>(
  "getAvailability",
);

export const holdBooking = callable<
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

export const payBooking = callable<{ reference: string; cardLast4: string }, PayResult>(
  "payBooking",
);

export const confirmFreeBooking = callable<{ reference: string }, PayResult>(
  "confirmFreeBooking",
);

export const cancelBooking = callable<{ reference: string; email: string }, { ok: boolean }>(
  "cancelBooking",
);
