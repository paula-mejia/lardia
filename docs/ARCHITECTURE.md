# Architecture Overview

> LarDia — eSocial compliance SaaS for Brazilian domestic employers

## Bird's Eye View

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  Landing · Simulator · Dashboard · Blog · FAQ · Auth    │
├─────────────────────────────────────────────────────────┤
│                    API ROUTES (/api)                     │
│  eSocial · Stripe · Newsletter · Background Check · ... │
├─────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC                        │
│  Calc Engine · eSocial Events · PDF Gen · Email · Audit │
├──────────────┬──────────────┬───────────────────────────┤
│   Supabase   │    Stripe    │  EC2 Proxy (mTLS)         │
│  Auth + DB   │   Billing    │  eSocial Gov API          │
└──────────────┴──────────────┴───────────────────────────┘
```

## Major Systems

### 1. Calculation Engine (`src/lib/calc/`)
The core value proposition. Pure functions that compute Brazilian labor obligations:
- **Payroll** — INSS (progressive), IRRF, FGTS, overtime, absences, DSR, net salary
- **Vacation** — 30 days + 1/3 bonus, abono pecuniário, proportional
- **13th Salary** — Two installments, proportional months
- **Termination** — Three types (sem justa causa, pedido demissão, justa causa), full TRCT
- **Tax Tables** — Versioned INSS/IRRF/FGTS rates, updated annually

All monetary calculations use `Math.round(value * 100) / 100`.

### 2. eSocial Integration (`src/lib/esocial/`)
Handles compliance with the Brazilian government's eSocial system:
- **Event Builder** — Transforms internal data → eSocial XML events (S-2200, S-1200, S-1210, etc.)
- **API Client** — SOAP envelope construction, submission, protocol polling
- **Proxy Client** — Routes through EC2 mTLS proxy for certificate-based auth
- **Monthly Processor** — Batch processes all employees for a given month
- **DAE Generator** — Computes unified tax payment guide
- **Certificate** — P12 loading, XML signing (infrastructure ready, proxy used in production)
- **RPA Client** — Browser automation fallback for eSocial portal

### 3. PDF Generation (`src/lib/pdf/`)
jsPDF-based generators for:
- Employment contracts, payslips, vacation receipts, prior notice, termination reports, DAE documents

### 4. Authentication & Authorization
- **Supabase Auth** — Email/password signup + magic links
- **Middleware** (`src/middleware.ts`) — Protects `/dashboard/*` routes, redirects unauthenticated users
- **RLS** — Row-level security in Supabase ensures tenant isolation

### 5. Billing (`src/lib/stripe/`)
- Stripe Checkout for subscription creation
- Stripe Customer Portal for self-service management
- Webhook handler for subscription lifecycle events
- Background check one-off payments

### 6. Dashboard (`src/app/dashboard/`)
Authenticated SPA-like experience:
- Employee CRUD, payroll history, contract generation
- eSocial event management, DAE history
- Calendar with deadline tracking
- Background check flow
- Settings, onboarding, referral program

### 7. Public Pages
- Landing page with sections (hero, features, pricing, testimonials, CTA)
- Salary simulator (`/simulador`) — public cost calculator
- Blog (`/blog`) — MDX articles for SEO
- FAQ, privacy policy, terms of service

## Data Flow

```
User Action → React Component → API Route → Business Logic → Supabase
                                    │
                                    ├→ Stripe (payments)
                                    ├→ Resend (emails)
                                    ├→ Twilio (WhatsApp)
                                    └→ EC2 Proxy → eSocial Gov API
```

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Server components for SEO pages, client components for interactive dashboard |
| Supabase over custom backend | Auth + DB + RLS in one service, fast iteration |
| EC2 mTLS proxy | Vercel serverless can't hold client certificates for eSocial |
| jsPDF over server-side PDF | Client-side generation avoids server load; works offline |
| Pure calc functions | Testable, no side effects, portable to any runtime |
| shadcn/ui | Copy-paste components, full control, Tailwind-native |
| In-memory rate limiter | Simple, sufficient for single-instance deployment |

## Architectural Boundaries

| Layer | Location | Rules |
|-------|----------|-------|
| **Frontend** | `src/app/`, `src/components/` | React components, hooks, UI logic only |
| **API** | `src/app/api/` | Request handling, auth checks, delegates to lib |
| **Business Logic** | `src/lib/` | Pure functions and services, no React imports |
| **Types** | `src/types/` | Shared interfaces, no logic |
| **Infrastructure** | `sentry.*.config.ts`, `middleware.ts` | Cross-cutting concerns |
