# Grow With Roja — Next.js + Firebase

A standalone port of the finished "Grow With Roja" coaching website to **Next.js 14 (App Router) + TypeScript + Tailwind CSS v3 + Firebase** (Auth, Firestore, Cloud Functions, Hosting).

The public site is visually identical to the approved design; the booking wizard and coach admin now run on Firebase instead of the original tRPC/MySQL stack.

## Stack

- Next.js 14 App Router, React 18, TypeScript, Tailwind CSS v3
- GSAP + ScrollTrigger, framer-motion, Lenis smooth scroll (all client-side)
- Firebase client SDK (Firestore reads, Auth, callable functions)
- Firebase Cloud Functions (Node 20, TypeScript) for the booking workflow
- Firebase Authentication (Google + email/password) guarding `/admin` via an `admin: true` custom claim

## Project layout

```
app/                  # Next.js routes: / (marketing site) and /admin (coach dashboard)
src/components/       # Navbar, Footer, Layout (Lenis init)
src/sections/         # Hero, About, HowICanHelp, Approach, Program, Testimonials, Booking, Contact
src/lib/              # firebase.ts, firebase-admin.ts, booking-api.ts, scroll.ts, utils.ts
src/hooks/useAuth.ts  # auth state + admin custom-claim check
functions/            # Cloud Functions (own package.json / tsconfig)
scripts/seed.ts       # Firestore seed script (Admin SDK)
firestore.rules       # security rules
firebase.json         # hosting + functions config
```

## Firestore data model

- `services/{slug}` — slug, title, description, durationMin, priceCents, currency, isActive, sortOrder. Seeded: Discovery Call (free, 20 min), 1:1 Coaching Session (60 min), Reclaim Your Power — 4-Week Program.
- `availabilitySlots/{id}` — kind (`one_off` | `recurring`), date | weekday, startTime, endTime, location, note, isActive.
- `blockedDates/{id}` — startDate, endDate, reason.
- `bookings/{id}` — reference (`GWR-YYYY-XXXX`), serviceId, date, startTime, endTime, client name/email/phone/notes, status (`held` | `confirmed` | `cancelled` | `rescheduled` | `completed`), paymentStatus, paymentRef, zoomJoinUrl, holdExpiresAt, timestamps.
- `settings/site` — business info.

## Booking business rules (mirrored in `functions/`)

- 10-minute slot hold, 15-minute buffer around existing bookings, 12-hour minimum notice
- Weekends unavailable by default
- Availability = active recurring/one-off slots − blocked dates − held/confirmed bookings
- Mock payment gateway declines last4 `0002` (mirrors Stripe test cards); real Stripe test mode when `STRIPE_SECRET_KEY` is set
- Booking references: `GWR-YYYY-XXXX`

## Setup

### 1. Create the Firebase project

1. [Firebase console](https://console.firebase.google.com) → Add project.
2. Enable **Authentication** → sign-in providers: **Google** and **Email/Password**.
3. Create **Cloud Firestore** (production mode).
4. Upgrade to the Blaze plan (required for Cloud Functions).
5. Project settings → **Your apps** → Web app → copy the config values.

### 2. Configure env vars

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_FIREBASE_* from the web app config
# fill in FIREBASE_* (Admin SDK service account) for the seed script
```

Service account: Project settings → **Service accounts** → Generate new private key.

### 3. Install, seed, run

```bash
npm install
npm run seed        # seeds services, availability slots, settings
npm run dev         # http://localhost:3000
```

### 4. Cloud Functions

```bash
cd functions
npm install
npm run build       # type-checks and compiles to lib/
```

Functions env config (create `functions/.env` — loaded automatically on deploy):

```
STRIPE_SECRET_KEY=sk_test_...
ZOOM_ACCOUNT_ID=...
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
SMTP_URL=smtps://user:pass@smtp.example.com
MAIL_FROM="Grow With Roja <hello@growwithroja.com>"
ADMIN_EMAIL=hello@growwithroja.com
SETUP_SECRET=a-long-random-string
```

All external integrations are env-gated with mock fallbacks, so the workflow
works end-to-end with none of them set.

### 5. Make a user admin

1. Sign in once at `/admin` (creates the Auth user), or create the user in the console.
2. Set `SETUP_SECRET` in `functions/.env`, deploy functions, then call:

```js
// from any JS shell with the Firebase client SDK, or the Firebase emulator UI
import { getFunctions, httpsCallable } from "firebase/functions";
await httpsCallable(getFunctions(), "setAdminClaim")({
  email: "coach@example.com",
  secret: "your-SETUP_SECRET",
});
```

3. Sign out and back in so the `admin: true` custom claim is picked up.
4. Rotate/remove `SETUP_SECRET` afterwards.

Alternatively, set the claim directly with the Admin SDK:

```js
await getAuth().setCustomUserClaims(uid, { admin: true });
```

### 6. Deploy

```bash
firebase login
firebase use --add            # select your project (updates .firebaserc)
firebase deploy --only firestore,functions
```

**Hosting:** the Next.js app uses SSR. Either:

- deploy with **Firebase App Hosting** (`firebase apphosting:backends:create`), or
- add `output: 'export'` to `next.config.mjs`, run `next build`, and deploy the static `out/` directory with `firebase deploy --only hosting` (rewrites are already configured in `firebase.json`).

## Environment variable reference

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | `.env.local` | client SDK config |
| `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | `.env.local` | Admin SDK (seed script, server code) |
| `STRIPE_SECRET_KEY` | `functions/.env` | Stripe test-mode PaymentIntents (mock when unset) |
| `ZOOM_ACCOUNT_ID` / `ZOOM_CLIENT_ID` / `ZOOM_CLIENT_SECRET` | `functions/.env` | Zoom Server-to-Server OAuth meeting creation (mock link when unset) |
| `SMTP_URL` / `MAIL_FROM` / `ADMIN_EMAIL` | `functions/.env` | nodemailer transactional email (no-op when unset) |
| `SETUP_SECRET` | `functions/.env` | one-time `setAdminClaim` setup |

## Cloud Functions API

| Function | Input | Notes |
| --- | --- | --- |
| `getAvailability` | `{ year, month }` | public; computed month calendar |
| `holdBooking` | `{ serviceId, date, startTime, name, email, phone?, notes? }` | creates 10-min hold |
| `payBooking` | `{ reference, cardLast4 }` | Stripe/mock payment, Zoom link, emails |
| `confirmFreeBooking` | `{ reference }` | confirms free discovery calls |
| `cancelBooking` | `{ reference, email }` | client self-service cancel |
| `setAdminClaim` | `{ email, secret }` | setup only, guarded by `SETUP_SECRET` |
