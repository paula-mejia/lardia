# LarDia — Architecture Overview

LarDia is a SaaS platform that simplifies eSocial compliance for Brazilian domestic employers (*empregadores domésticos*). It automates payroll calculation, tax filing, DAE generation, and employee lifecycle management.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        End User (Browser)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel (Edge + Serverless)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js 16 App (React 19, App Router)               │   │
│  │  - SSR pages & API routes                            │   │
│  │  - Middleware (auth guard)                            │   │
│  │  - Sentry error tracking (client, server, edge)      │   │
│  │  - Vercel Analytics & Speed Insights                 │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│  Supabase (Backend)  │  │  EC2 Proxy (São Paulo, Brazil)   │
│  - PostgreSQL (RLS)  │  │  - mTLS termination              │
│  - Auth (magic link  │  │  - .p12 certificate handling     │
│    + password)       │  │  - Forwards SOAP to eSocial API  │
│  - Edge Functions    │  │  - API-key authenticated         │
│  - Storage           │  │  - Health check endpoint         │
└─────────────────────┘  └──────────────┬───────────────────┘
                                        │ mTLS (client cert)
                                        ▼
                          ┌──────────────────────────────┐
                          │  eSocial Government API       │
                          │  (SOAP Web Services)          │
                          │  - EnviarLoteEventos          │
                          │  - ConsultarLoteEventos       │
                          └──────────────────────────────┘
```

**Why an EC2 proxy?** Vercel's serverless functions cannot perform mTLS with client certificates. The EC2 instance in São Paulo holds the employer's `.p12` digital certificate and terminates the mutual TLS handshake required by the eSocial government API.

---

## 2. Data Flow Diagrams

### 2.1 Standard Data Operations (CRUD, Payroll, PDFs)

```
User ──► Vercel (Next.js API route)
              │
              │  1. Middleware validates Supabase session cookie
              │  2. Rate limiter checks IP / user quota
              │  3. Business logic (calc engine, PDF generation, etc.)
              │
              ▼
         Supabase PostgreSQL
              │
              │  - Row Level Security enforces tenant isolation
              │  - Service role used for audit log inserts
              │
              ▼
         Response ──► User
```

### 2.2 eSocial Event Submission

```
User ──► Vercel (POST /api/esocial/events)
              │
              │  1. Auth + rate limit
              │  2. Event builder validates data, generates XML
              │  3. Stores event record (status: "submitted")
              │
              ▼
         Vercel (POST /api/esocial/proxy)
              │
              │  JSON payload with SOAP body
              │  x-api-key header
              │
              ▼
         EC2 Proxy (São Paulo)
              │
              │  1. Validates API key
              │  2. Loads .p12 certificate
              │  3. Constructs HTTPS agent with client cert
              │  4. Sends SOAP envelope to eSocial WS
              │
              ▼
         eSocial Gov API
              │
              │  SOAP response (protocol number or errors)
              │
              ▼
         EC2 Proxy ──► Vercel ──► Supabase (update event status)
                                       │
                                       ▼
                                  Response ──► User
```

### 2.3 eSocial Health Check

```
User ──► Vercel (GET /api/esocial/health)
              │
              ▼
         EC2 Proxy (GET /health)
              │
              ▼
         { healthy: bool, latencyMs: number }
```

---

## 3. Authentication Flow

LarDia uses **Supabase Auth** with two methods:

| Method | Role | Details |
|--------|------|---------|
| **Password** (default) | Traditional email + password | Primary method at `/login` and `/signup` |
| **Magic Link** (secondary) | Passwordless email login | Available but requires working SMTP; not currently primary |

**Autoconfirm:** Enabled in Supabase — new users are confirmed immediately on signup without needing to verify their email address.

### Middleware Protection

The Next.js middleware (`src/middleware.ts`) runs on every matched route:

```
Matcher: /dashboard/*, /login, /signup

Request ──► Middleware
              │
              ├─ /dashboard/* + no session → redirect /login
              ├─ /login or /signup + active session → redirect /dashboard
              └─ otherwise → pass through (refresh session cookies)
```

The middleware creates a Supabase server client using `@supabase/ssr`, calls `getUser()` to validate the session, and refreshes cookies on every request.

---

## 4. Key Modules

### 4.0 Logo (`src/components/logo.tsx`)

The LarDia logo is an **SVG React component** (not an image file). It renders inline SVG for crisp display at any size. The design features double chevrons in the brand color (emerald-500). The favicon is also generated from this SVG.

### 4.1 Calculation Engine (`src/lib/calc/`)

Pure TypeScript functions for Brazilian labor law math. No side effects, fully unit-tested.

| File | Purpose |
|------|---------|
| `tax-tables.ts` | INSS brackets (progressive), IRRF brackets, minimum wage, employer rates (CP Patronal 8%, GILRAT 0.8%, FGTS 8%, FGTS antecipação 3.2%). Updated annually. |
| `payroll.ts` | Full payroll breakdown: gross → INSS employee (progressive) → IRRF → FGTS → employer contributions → net salary → DAE total. |
| `thirteenth-salary.ts` / `thirteenth.ts` | 13th salary (Christmas bonus) calculation, first and second installments. |
| `vacation.ts` | Vacation pay: salary + 1/3 constitutional bonus, proportional calculations. |
| `termination.ts` | Termination (rescisão): FGTS penalty (40%), notice period, proportional vacation and 13th, balance of salary. |

### 4.2 eSocial Module (`src/lib/esocial/`)

Handles all communication with the Brazilian eSocial system.

| File | Purpose |
|------|---------|
| `api-client.ts` | Direct SOAP client (`EsocialApiClient`) for dev/testing + proxy client (`EsocialProxyClient`) for production. Builds SOAP envelopes, parses XML responses, logs all API interactions. |
| `certificate.ts` | Loads `.p12` certificates via `node-forge`, extracts PEM keys, signs XML events with `xml-crypto` (XMLDSig enveloped signature, RSA-SHA256). Validates certificate expiry and CNPJ extraction. |
| `rpa-client.ts` | Playwright-based browser automation for eSocial web portal. Authenticates via Gov.br SSO with client certificate, navigates domestic employer sections, generates/downloads DAE PDFs. |
| `events.ts` | TypeScript type definitions for all eSocial event types: S-2200 (admission), S-2206 (contract change), S-1200 (remuneration), S-1210 (payments), S-2230 (leave), S-2250 (prior notice), S-2299 (termination), S-2300 (TSV). |
| `event-builder.ts` | Transforms LarDia internal data into validated eSocial event objects. Field validation (CPF, dates, required fields). |
| `dae-generator.ts` | Calculates DAE (tax payment document) with all components: INSS employee + patronal, GILRAT, FGTS monthly + anticipation, IRRF. Computes due dates (7th of following month, adjusted for weekends). Generates mock Febraban barcodes. |
| `monthly-processor.ts` | Orchestrates monthly processing: iterates all employees, runs payroll calc, generates S-1200 + S-1210 events, produces DAE record. |

### 4.3 PDF Generators (`src/lib/pdf/`)

Uses `jspdf` to generate downloadable PDF documents:

- `payslip.ts` — Monthly pay stub (holerite)
- `employment-contract.ts` — Employment contract
- `vacation-receipt.ts` — Vacation receipt
- `termination-report.ts` — Termination report (TRCT)
- `prior-notice.ts` — Prior notice document
- `dae.ts` — DAE payment guide with barcode

### 4.4 Email (`src/lib/email.ts`)

Transactional email via **Resend** SDK:

- `sendWelcomeEmail` — Post-signup onboarding
- `sendDaeReminderEmail` — DAE payment due date reminder
- `sendPayrollProcessedEmail` — Monthly payroll confirmation
- `sendGenericEmail` — Flexible template

Sender: `LarDia <noreply@lardia.com.br>` (custom domain) with Resend dev fallback.

### 4.5 Background Check (`src/lib/background-check/`)

Employee background verification (CPF validation, criminal records, lawsuits, credit check):

- `service.ts` — Mock mode for MVP; production mode planned for BigDataCorp API integration
- `cpf-validation.ts` — CPF checksum validation
- `pdf.ts` — Background check report PDF generation
- Paid per-check via Stripe (separate checkout session)

### 4.6 Audit Logging (`src/lib/audit.ts`)

All significant user actions are logged to the `audit_logs` Supabase table:

- Uses service role to bypass RLS
- Captures: action type, resource, employer ID, IP address, user agent, metadata
- Action types: `login`, `signup`, `employee_created`, `payroll_calculated`, `esocial_event_submitted`, `pdf_generated`, `subscription_created`, etc.
- Fire-and-forget: audit errors never break the main request flow

---

## 5. Rate Limiting Strategy

In-memory sliding window rate limiter (`src/lib/rate-limit.ts`):

| Preset | Max Requests | Window | Use Case |
|--------|-------------|--------|----------|
| `auth` | 5 | 60 s | Login / signup endpoints |
| `api` | 30 | 60 s | General API routes |
| `dashboard` | 60 | 60 s | Dashboard data fetches |
| `public` | 20 | 60 s | Public pages (simulator, newsletter) |
| `backgroundCheck` | 3 | 1 hour | Paid background check requests |

**Implementation details:**
- Key = `{prefix}:{userId or IP}` (authenticated users keyed by ID, anonymous by IP)
- IP extracted from `x-forwarded-for` or `x-real-ip` headers (Vercel proxy chain)
- Stale entries cleaned every 5 minutes via `setInterval`
- Returns 429 with `Retry-After`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers
- Helper `applyRateLimit()` returns `null` (allowed) or a `NextResponse` (blocked)

**Limitation:** In-memory store resets on serverless cold starts. Acceptable for current scale; Redis-backed limiter planned for growth.

---

## 6. External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Supabase** | Database (PostgreSQL + RLS), Auth (magic link + password), Edge Functions (send-reminders), Storage | `@supabase/ssr` + `@supabase/supabase-js` |
| **Vercel** | Hosting (SSR + serverless API routes), Edge middleware, Analytics, Speed Insights | Next.js 16 deployment, `@vercel/analytics`, `@vercel/speed-insights` |
| **Stripe** | Subscription billing, per-use background check payments, customer portal | `stripe` SDK (server), `@stripe/stripe-js` (client), webhook at `/api/stripe/webhook` |
| **Resend** | Transactional email (welcome, DAE reminders, payroll confirmations) | `resend` SDK |
| **Sentry** | Error monitoring and performance tracing (client, server, edge configs) | `@sentry/nextjs` |
| **Google Analytics 4** | User analytics and conversion tracking | `gtag` via `src/lib/analytics.ts` |
| **Meta Pixel** | Marketing attribution and conversion tracking | `fbq` via `src/lib/analytics.ts` |
| **EC2 (São Paulo)** | eSocial mTLS proxy — terminates client certificate TLS, forwards SOAP requests | Custom HTTP proxy, API-key auth, health endpoint |

---

## 7. Project Structure (Simplified)

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── audit/              # Audit log queries
│   │   ├── background-check/   # Background check CRUD
│   │   ├── esocial/            # eSocial proxy, events, DAE, health
│   │   ├── newsletter/         # Newsletter subscribe/unsubscribe
│   │   └── stripe/             # Checkout, webhook, portal
│   ├── dashboard/              # Protected app pages
│   │   ├── admin/              # Admin: logs, audit viewer
│   │   ├── background-check/   # Background check UI
│   │   ├── calendar/           # Deadline calendar
│   │   ├── contracts/          # Employment contracts
│   │   ├── employees/[id]/     # Employee detail (payroll, vacation, termination, etc.)
│   │   ├── esocial/            # eSocial dashboard, events, DAE, connect, status
│   │   ├── onboarding/         # First-time setup
│   │   ├── referral/           # Referral program
│   │   └── settings/           # Account settings, subscription
│   ├── blog/                   # Public blog (MDX content)
│   ├── calculadoras/           # Public calculators (SEO)
│   ├── simulador/              # Public payroll simulator
│   └── faq/                    # FAQ page
├── lib/
│   ├── calc/                   # Payroll calculation engine
│   ├── esocial/                # eSocial integration layer
│   ├── pdf/                    # PDF document generators
│   ├── background-check/       # Background check service
│   ├── stripe/                 # Stripe configuration
│   ├── supabase/               # Supabase client (browser) & server
│   ├── audit.ts                # Audit logging
│   ├── email.ts                # Resend email helpers
│   ├── rate-limit.ts           # Rate limiter
│   ├── analytics.ts            # GA4 + Meta Pixel tracking
│   ├── deadlines.ts            # Labor law deadline calculations
│   └── env.ts                  # Environment variable validation
├── middleware.ts                # Auth guard (Supabase session check)
└── types/                      # Shared TypeScript types
supabase/
└── functions/
    └── send-reminders/         # Edge Function: scheduled DAE reminders
```
