# Housekeeping Report

> Full audit of the LarDia codebase | 2026-02-17

## Metrics

| Metric | Value |
|--------|-------|
| Total source files (TS/TSX) | ~160 |
| Total lines of code (src/) | ~24,200 |
| Files > 300 lines | 18 |
| Files > 500 lines | 3 |
| Exported functions/components | ~130 |
| Unused exports (dead code) | ~13 |
| Orphaned pages/components | 3 |
| Duplicate modules | 2 |
| API routes | 18 |
| UI components (shadcn) | 14 |
| Calculation modules | 5 (payroll, vacation, 13th, termination, tax-tables) |
| PDF generators | 6 |
| Test files | 9 (5 unit + 4 E2E) |

---

## Key Findings

### ✅ Strengths
1. **Well-organized project structure** — clear separation between app routes, components, and lib
2. **Comprehensive README** — already documents tech stack, structure, conventions, and deployment
3. **Pure calculation engine** — `src/lib/calc/` uses pure functions with proper test coverage
4. **Consistent conventions** — English code, Portuguese UI, JSDoc on most lib functions
5. **Type safety** — TypeScript throughout, shared types in `src/types/`
6. **Security** — Rate limiting, audit logging, RLS, auth middleware

### ⚠️ Issues Found
1. **Orphaned `conectar/` page** (340 lines) — duplicate of `connect/`, no links point to it
2. **4 unused email templates** in `email.ts` — never called (likely awaiting integration)
3. **~10 unused eSocial functions** — infrastructure for direct API (currently using proxy)
4. **`ProxyHealthIndicator` component** — exported but never imported
5. **Dual audit functions** — `logAudit` (new) vs `auditLog` (legacy), both in use
6. **`thirteenth-salary.ts`** — unnecessary re-export wrapper
7. **Hardcoded referral domain** — uses `lardia.vercel.app` instead of env-based URL
8. **3 files > 500 lines** — `api-client.ts` (643), `simulador-client.tsx` (578), `process/page.tsx` (529)

### 🏗️ Architecture Assessment
- **Boundaries are clean** — no React imports in `src/lib/`, no business logic in components
- **API routes properly delegate** — thin handlers that call into lib functions
- **Supabase client separation** — proper browser vs server client split
- **Single concern per calc module** — each file handles one domain concept

---

## Actions Taken in This Audit

1. ✅ Created `docs/DEAD_CODE_REPORT.md` — all dead code candidates with confidence levels
2. ✅ Created `docs/ARCHITECTURE.md` — bird's eye view, systems, data flow
3. ✅ Created `docs/CLEANUP_PLAN.md` — prioritized action items
4. ✅ Created this report (`docs/HOUSEKEEPING_REPORT.md`)
5. ✅ Added JSDoc to functions missing documentation (see below)
6. ✅ Verified no TypeScript errors introduced

## JSDoc Added To

- `src/lib/analytics.ts` — all 9 tracking functions
- `src/lib/referral.ts` — all 6 functions
- `src/lib/rate-limit.ts` — `RATE_LIMITS`, `checkRateLimit`, `getClientIp`, `applyRateLimit`
- `src/components/employee-form/format.ts` — `formatCPF`, `formatPhone`, `formatCEP`
- `src/components/calculator/format.ts` — `formatBRL`, `formatDateBR`
- `src/lib/stripe/config.ts` — `getStripe`, `getStripeJs`
- `src/lib/utils.ts` — `cn`
- `src/lib/env.ts` — `env`, `serverEnv`

---

## Recommendations

See `docs/CLEANUP_PLAN.md` for the full prioritized list. Top 3:

1. **Delete the orphaned `conectar/` page** — 340 lines of dead code, zero risk
2. **Split `api-client.ts`** (643 lines) into 3-4 focused modules
3. **Consolidate audit functions** — migrate `auditLog` callers to `logAudit`
