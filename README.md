# LarDia

> Smart eSocial compliance SaaS for Brazilian domestic employers.

LarDia helps *empregadores domésticos* (domestic employers) in Brazil stay compliant with **eSocial** — the government's unified digital bookkeeping system for labor, social security, and tax obligations. It automates payroll calculations, tax withholdings, and eSocial event submission so employers can manage their household employees without needing an accountant.

---

## Features

| Area | Description |
|------|-------------|
| **Payroll calculator** | Monthly salary breakdown with INSS (progressive), IRRF, FGTS, absences, DSR, and overtime |
| **13th salary** | First and second installment calculation with proportional months |
| **Férias (vacation)** | Vacation pay, ⅓ constitutional bonus, proportional and advance calculations |
| **Rescisão (termination)** | Full termination settlement: notice period, pending vacation, proportional 13th, FGTS penalty |
| **DAE generation** | Unified domestic employer tax slip (INSS employee + employer + GILRAT + FGTS + anticipation) |
| **eSocial integration** | XML event generation and submission via eSocial web services |
| **Background check** | Employee background verification flow |
| **Salary simulator** | Public-facing cost simulator for prospective employers |
| **Blog / content** | MDX-powered blog with SEO-optimized articles (PT-BR) |
| **Newsletter** | Email capture and campaign delivery via Resend |
| **Referral program** | User-to-user referral tracking with rewards |
| **Stripe billing** | Subscription management with free trial support |
| **Dashboard** | Employee management, contracts, payroll history, calendar, settings |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.x |
| Language | TypeScript | 5.x |
| UI components | shadcn/ui + Radix UI | 1.4.x |
| Styling | Tailwind CSS (brand: emerald-500 #10B981) | 4.x |
| Auth / DB / Storage | Supabase (PostgreSQL) | JS SDK 2.95.x |
| Payments | Stripe | 20.x |
| Email | Resend | 6.x |
| PDF generation | jsPDF | 4.x |
| XML / crypto | xml-crypto, xml2js, node-forge | — |
| Error tracking | Sentry | 10.x |
| Analytics | Vercel Analytics + Speed Insights | — |
| Unit testing | Vitest | 4.x |
| E2E testing | Playwright | 1.58.x |
| Hosting | Vercel (frontend) + EC2 reverse proxy | — |

---

## Project Structure

```
lardia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, signup)
│   │   ├── api/                # API routes
│   │   │   ├── esocial/        #   eSocial event submission
│   │   │   ├── stripe/         #   Billing webhooks
│   │   │   ├── newsletter/     #   Newsletter subscribe/unsubscribe
│   │   │   ├── referral/       #   Referral tracking
│   │   │   ├── background-check/ # Background check API
│   │   │   └── audit/          #   Audit logging
│   │   ├── blog/               # Blog listing & article pages
│   │   ├── calculadoras/       # Public calculator pages
│   │   ├── simulador/          # Public salary simulator
│   │   ├── dashboard/          # Authenticated dashboard
│   │   │   ├── employees/      #   Employee CRUD
│   │   │   ├── contracts/      #   Employment contracts
│   │   │   ├── esocial/        #   eSocial event management
│   │   │   ├── calendar/       #   Payment calendar
│   │   │   ├── background-check/ # Background check UI
│   │   │   ├── referral/       #   Referral program
│   │   │   ├── settings/       #   Account settings
│   │   │   └── onboarding/     #   New user onboarding
│   │   ├── faq/                # FAQ page
│   │   ├── privacidade/        # Privacy policy
│   │   └── termos/             # Terms of service
│   ├── components/             # React components
│   │   ├── ui/                 #   shadcn/ui primitives
│   │   ├── calculator/         #   Calculator widgets
│   │   ├── analytics/          #   Analytics components
│   │   └── ...                 #   Shared components
│   ├── lib/                    # Core business logic
│   │   ├── calc/               #   Calculation engine ⭐
│   │   │   ├── payroll.ts      #     Monthly payroll
│   │   │   ├── vacation.ts     #     Vacation pay
│   │   │   ├── thirteenth-salary.ts # 13th salary
│   │   │   ├── termination.ts  #     Termination settlement
│   │   │   ├── tax-tables.ts   #     Versioned INSS/IRRF/FGTS rates
│   │   │   └── __tests__/      #     Unit tests
│   │   ├── esocial/            #   eSocial XML generation & signing
│   │   ├── supabase/           #   Supabase client (browser + server)
│   │   ├── stripe/             #   Stripe helpers
│   │   ├── background-check/   #   Background check logic
│   │   ├── pdf/                #   PDF report generation
│   │   └── ...                 #   Utilities (email, analytics, rate-limit)
│   ├── types/                  # Shared TypeScript types
│   └── middleware.ts           # Auth & route protection
├── content/
│   └── blog/                   # MDX blog posts
├── e2e/                        # Playwright E2E tests
├── scripts/                    # Utility scripts
├── supabase/                   # Supabase migrations & config
├── public/                     # Static assets
├── sentry.*.config.ts          # Sentry configuration (client/server/edge)
├── playwright.config.ts
├── vitest.config.ts
└── next.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **npm** (ships with Node)
- A **Supabase** project (for auth, database, and storage)

### Install

```bash
git clone git@github.com:<org>/lardia.git
cd lardia
npm install
```

### Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local   # or create .env.local manually
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Optional | Stripe subscription price ID |
| `NEXT_PUBLIC_SITE_URL` | Optional | Public site URL (defaults to `http://localhost:3000`) |
| `SENTRY_DSN` | Optional | Sentry DSN for error tracking |

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

### Unit Tests (Vitest)

```bash
npm test              # single run
npm run test:watch    # watch mode
```

Unit tests live alongside the modules they cover, primarily in `src/lib/calc/__tests__/`. Every calculation module must have comprehensive tests covering edge cases (proportional months, mid-month changes, ceiling values).

### E2E Tests (Playwright)

```bash
npx playwright install          # first time — install browsers
npm run test:e2e                # headless
npm run test:e2e:headed         # with browser UI
```

E2E specs are in `e2e/` and cover landing page, simulator, blog, FAQ, and auth flows. Tests run against `http://localhost:3000` — make sure the dev server is running.

---

## Deployment

### Vercel (Primary)

The app deploys to **Vercel** on push. Environment variables are configured in the Vercel dashboard.

- Production branch: `main`
- Preview deployments: every PR gets a unique URL

### Custom Domain

- **lardia.com.br** — primary domain (Vercel)
- **www.lardia.com.br** — redirects to apex
- **api.lardia.com.br** — eSocial mTLS proxy (EC2, HTTPS via Let's Encrypt)

### EC2 eSocial Proxy

An EC2 instance in São Paulo (`api.lardia.com.br`) handles mTLS termination for the eSocial government API, since Vercel serverless functions cannot hold client certificates. HTTPS is provided via Let's Encrypt with automatic renewal.

---

## Code Conventions

- **Code language:** English (variables, functions, comments, commits)
- **UI language:** Brazilian Portuguese — hardcoded, no i18n
- **Commits:** English, imperative mood
- **Branches:** `feature/xxx`, `fix/xxx`
- **Rounding:** `Math.round(value * 100) / 100` for all monetary values
- **Tax tables:** versioned in `tax-tables.ts`, never hardcoded in calc logic

---

## Calculation Engine

The calc engine in `src/lib/calc/` is the core value proposition. Key rules:

- **INSS employee:** progressive brackets (7.5 %, 9 %, 12 %, 14 %)
- **INSS employer:** 8 % CP Patronal + 0.8 % GILRAT
- **FGTS:** 8 % monthly + 3.2 % anticipation
- **IRRF:** progressive brackets, applied after INSS deduction
- **Daily rate:** salary ÷ 30 (commercial month)
- **Hourly rate:** salary ÷ 220 (full-time)
- **100 % accuracy is mandatory** — this is what users pay for

---

## License

Proprietary. All rights reserved.
