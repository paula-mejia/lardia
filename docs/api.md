# Lardia API Reference

All API routes are Next.js App Router handlers under `src/app/api/`.

## Rate Limiting

In-memory rate limiter (`src/lib/rate-limit.ts`) with presets:

| Preset | Max Requests | Window |
|--------|-------------|--------|
| `auth` | 5 | 60s |
| `api` | 30 | 60s |
| `dashboard` | 60 | 60s |
| `public` | 20 | 60s |
| `backgroundCheck` | 3 | 1 hour |

Rate-limited responses return `429` with `Retry-After` header.

---

## Audit

### POST `/api/audit`

Log an audit event.

- **Auth:** Optional (logs user/employer if authenticated)
- **Rate limit:** `api` (30/min)
- **Body:** `{ action: string, resource?: string, metadata?: object }`
  - Allowed actions: `login`, `signup`, `logout`, `employee_created`, `employee_updated`, `payroll_calculated`, `payroll_saved`
- **Response:** `{ ok: true }`

---

## Background Check

### POST `/api/background-check`

Run a background check on a candidate.

- **Auth:** Required (Supabase)
- **Rate limit:** `backgroundCheck` (3/hour)
- **Body:** `{ candidateName: string, candidateCpf: string, candidateDob: string, lgpdConsent: boolean }`
- **Response:** `{ id: string, status: "completed" }`
- **Errors:** 400 (invalid CPF, missing data, no LGPD consent), 401, 404 (employer not found)

### GET `/api/background-check/[id]`

Get a single background check by ID.

- **Auth:** Required (Supabase) — scoped to employer
- **Rate limit:** `api` (30/min)
- **Params:** `id` (path)
- **Response:** Full `background_checks` row (JSON)

### GET `/api/background-check/history`

List all background checks for the authenticated employer.

- **Auth:** Required (graceful degradation — returns empty list if unauthenticated)
- **Rate limit:** `api` (30/min)
- **Response:** `{ checks: [{ id, candidate_name, candidate_cpf, status, created_at }] }`

---

## eSocial

### GET `/api/esocial/dashboard`

Full dashboard summary: connection status, event counts, DAE, timeline, next actions.

- **Auth:** Required (Supabase)
- **Rate limit:** None
- **Response:** `{ connection, summary, timeline, nextActions, currentMonth, currentYear }`

### GET `/api/esocial/events`

List eSocial events with optional filters.

- **Auth:** Required (Supabase)
- **Rate limit:** None
- **Query params:** `month`, `year`, `status`, `event_type` (all optional)
- **Response:** `{ events: [...] }` (max 200)

### POST `/api/esocial/events/[id]/retry`

Retry a failed eSocial event (resets status from `erro` to `pendente`).

- **Auth:** Required (Supabase) — scoped to employer
- **Rate limit:** None
- **Params:** `id` (path)
- **Response:** `{ success: true, message: "Evento marcado para reenvio" }`

### POST `/api/esocial/process`

Process monthly payroll: generates S-1200/S-1210 events and DAE for all active employees.

- **Auth:** Required (Supabase)
- **Rate limit:** Custom (1/min)
- **Body:** `{ month?: number, year?: number }` (defaults to current)
- **Response:** Full processing result with per-employee payroll breakdown, DAE details, errors
- **Errors:** 409 if events already exist for the month

### GET `/api/esocial/health`

Check eSocial EC2 proxy health.

- **Auth:** Required (Supabase)
- **Rate limit:** `api` (30/min)
- **Response:** `{ status, healthy, message, latencyMs, environment, timestamp }`

### GET `/api/esocial/proxy?action=health|test`

Server-side proxy to eSocial API — health check.

- **Auth:** Required (Supabase)
- **Rate limit:** `api` (30/min)
- **Response:** `{ connected, healthy, ... }`

### POST `/api/esocial/proxy?action=send|query`

Server-side proxy to eSocial API — send or query event batches. Keeps proxy API key server-side.

- **Auth:** Required (Supabase)
- **Rate limit:** `api` (30/min)
- **Body:** Event data + `{ environment: "production" | "restricted" }`
- **Response:** Proxied response from eSocial

### GET `/api/esocial/dae`

List all DAE records for the authenticated employer.

- **Auth:** Required (Supabase)
- **Rate limit:** `api` (30/min)
- **Response:** Array of `dae_records` rows

### GET `/api/esocial/dae/[id]/pdf`

Download DAE as PDF.

- **Auth:** Required (Supabase) — scoped to employer
- **Rate limit:** `api` (30/min)
- **Params:** `id` (path)
- **Response:** `application/pdf` attachment

---

## Newsletter

### POST `/api/newsletter`

Subscribe an email to the newsletter.

- **Auth:** None (public)
- **Rate limit:** `public` (20/min)
- **Body:** `{ email: string, name?: string, source?: "landing"|"blog"|"simulator"|"calculator"|"faq", lgpdConsent: boolean }`
- **Response:** `{ success: true }`
- **Notes:** Upserts — re-subscribes previously unsubscribed emails

### POST `/api/newsletter/unsubscribe`

Unsubscribe an email.

- **Auth:** None (public)
- **Rate limit:** `public` (20/min)
- **Body:** `{ email: string }`
- **Response:** `{ success: true }`

---

## Referral

### POST `/api/referral/reward`

Reward a referrer when their referee subscribes (adds 1 bonus month).

- **Auth:** None (server-side Supabase client)
- **Rate limit:** `api` (30/min)
- **Body:** `{ refereeEmployerId: string }`
- **Response:** `{ success: true }` or `{ message: "No pending referral found" }`

---

## Stripe

### POST `/api/stripe/checkout`

Create a Stripe Checkout session for a Pro subscription (R$29.90/month).

- **Auth:** Required (Supabase)
- **Rate limit:** `api` (30/min)
- **Body:** None
- **Response:** `{ url: string }` (Stripe checkout URL)

### POST `/api/stripe/background-check`

Create a Stripe Checkout session for a one-time background check payment (R$99.90).

- **Auth:** Required (Supabase)
- **Rate limit:** `backgroundCheck` (3/hour)
- **Body:** None
- **Response:** `{ url: string }` (Stripe checkout URL)

### POST `/api/stripe/portal`

Create a Stripe Billing Portal session for subscription management.

- **Auth:** Required (Supabase)
- **Rate limit:** `api` (30/min)
- **Body:** None
- **Response:** `{ url: string }` (portal URL)
- **Errors:** 404 if no `stripe_customer_id` on employer

### POST `/api/stripe/webhook`

Handle Stripe webhook events. Verified via `stripe-signature` header.

- **Auth:** Stripe signature verification (no user auth)
- **Rate limit:** None
- **Body:** Raw Stripe event payload
- **Handled events:**
  - `checkout.session.completed` — activates subscription, rewards referrer
  - `customer.subscription.updated` — syncs status
  - `customer.subscription.deleted` — marks canceled
  - `invoice.payment_failed` — marks past_due
- **Response:** `{ received: true }`
