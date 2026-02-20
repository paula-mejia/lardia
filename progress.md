# Project Progress - LarDia

## Current Status
All quick fixes done (2026-02-19). Lint: 0 errors, 0 warnings. Tests: 77 pass, 3 pre-existing failures. 6 items remain - all need decisions or more involved work. App is NOT live yet; eSocial government connection still needs to be built.

## Recently Completed

### Quick Fixes Round 2 (2026-02-19)

**Fix #9: DAE insert errors now surface to the user**
- `src/app/api/esocial/process/route.ts` - DAE insert failures no longer silently swallowed
- Added `warnings` field to response so the UI can show when events succeeded but DAE failed
- Also removed unused `getClientIp` function from this file

**Fix #10: UPDATE/DELETE RLS policies added**
- New migration `supabase/migrations/20260219_002_esocial_dae_update_delete_policies.sql`
- Added UPDATE and DELETE policies for both `esocial_events` and `dae_records`
- Users can now update/delete their own records (needed for retry, reprocess, mark as paid)

**Fix #11: Sensitive info redacted from docs**
- `docs/deployment.md` - replaced EC2 IP, Supabase project ID, SSH key path with placeholders
- `LARDIA-STATUS.md` - replaced EC2 IP, Supabase project ID, personal email, SSH key path, company CNPJ with placeholders

**Fix #14: All 23 lint warnings fixed (now 0 errors, 0 warnings)**
- Removed unused imports across 13 files (PublicNav, getClientIp, lucide icons, referral functions, etc.)
- Removed unused variables (maskCPF, completedCount, totalDAEAnnual, dailyRate, _FROM_EMAIL, _field3, _hasErrors)

**Fix #16: Newsletter endpoint reviewed - kept as-is**
- Service role key is intentional: the upsert pattern (re-subscribe) requires bypassing RLS since anon users can't update existing rows

**Fix #17: Audit logging non-null assertions fixed**
- `src/lib/audit.ts` - replaced `process.env.*!` with null-safe checks
- `getServiceSupabase()` returns `null` if env vars missing
- `logAudit()` silently skips if Supabase client can't be created (still never breaks main flow)

### Top 5 Critical Fixes (2026-02-19, earlier)

**Fix 1: Hardcoded credentials removed from test script**
- `scripts/test-esocial-api.ts` - all credentials now from env vars
- `.env.example` updated, `.gitignore` updated

**Fix 2: Invalid status values fixed**
- Retry route: `'erro'` -> `'rejected'`, `'pendente'` -> `'draft'`
- Process route: `'pending'` -> `'draft'`

**Fix 3: Monthly processor fixed**
- Events now start as `'draft'` (not premature `'accepted'`)

**Fix 4: Payslip confirmation RLS tightened**
- Confirm route uses service role client
- New migration drops `using(true)`, adds employer-scoped SELECT

**Fix 5: Status page proxy path corrected**
- `/api/esocial/test` -> `/health`

## Remaining Issues - Need Decisions

### #2: Replace in-memory rate limiter (CRITICAL for launch)
- **Problem:** `src/lib/rate-limit.ts` uses `Map()` that resets on every Vercel cold start
- **Decision needed:** Vercel KV vs Upstash Redis vs external Redis
- **When:** Before launch. Not urgent now since app isn't live.

### #6: Add Twilio webhook signature verification
- **Problem:** `src/app/api/whatsapp/webhook/route.ts` doesn't validate `X-Twilio-Signature`
- **Decision needed:** WhatsApp is Phase 2. Fix when Twilio account is set up.
- **Dependency:** Paula needs to create Twilio account first.

### #8: Add subscription enforcement middleware
- **Problem:** Stripe processes payments but nothing blocks dashboard for unpaid users
- **Decision needed:** What should happen for expired/missing subscriptions? Hard block vs grace period vs feature gating?
- **When:** Before launch. Needs product decision.

### #12: Consolidate duplicate error classifiers
- **Problem:** `classifyError()` in proxy route vs `classifyProxyError()` in api-client.ts
- **Decision needed:** Which one to keep? Different fallback values.
- **When:** When building the real eSocial submission flow.

### #13: Standardize API response patterns
- **Problem:** Response helper at `src/lib/api/response.ts` used by only 3 of 21+ routes
- **Decision needed:** Standardize all routes or remove the helper? Big refactor.
- **When:** Not urgent. Can do incrementally.

### #15: Remove unused twilio dependency
- **Problem:** 15MB+ package installed but WhatsApp is Phase 2
- **Decision needed:** Remove now and re-add later, or keep for Phase 2?
- **When:** If bundle size becomes an issue.

### Pre-existing test failures
- `thirteenth-salary.test.ts` and `thirteenth.test.ts` - 3 failures
- `calculateMonthsWorked` counts day 16 as a full month, tests expect it doesn't
- **Decision needed:** Is the function correct or the tests? Check Brazilian labor law for 13th salary proportional month rules.

### Credential rotation
- Certificate password, CNPJ, CPF are in git history
- **When:** Before connecting to eSocial production

## Architecture Overview
- **Stack:** Next.js 16 (App Router) + TypeScript + Supabase + Vercel
- **App status:** NOT live. Landing page, simulador, calc engine, dashboard UI built. eSocial government connection is the big missing piece.
- **Core value:** Calculation engine in `src/lib/calc/`
- **eSocial integration:** EC2 proxy in Sao Paulo for mTLS certificate handling
- **Payments:** Stripe subscriptions + per-use background checks
- **Email:** Resend (noreply@lardia.com.br)
- **DB:** PostgreSQL via Supabase with RLS on all tables

## Key Decisions
- Used `'rejected'` as the error state for retry (maps to eSocial rejection)
- Used `'draft'` as initial state for generated events (not yet submitted)
- Payslip confirm route switched to service role to allow RLS lockdown
- Newsletter endpoint kept with service role (needed for upsert pattern)
- Audit logging fails gracefully if env vars missing (returns null, skips)

## Session Log
### 2026-02-18
- Comprehensive 6-dimension code review
- Cross-checked against second model's review

### 2026-02-18 (evening - Paula solo)
- 20 commits: landing page redesign, simulador overhaul, pricing toggle
- All deployed to Vercel

### 2026-02-19
- Pulled 20 new commits, cross-validated reviews
- Implemented top 5 critical fixes (credentials, status values, monthly processor, RLS, proxy path)
- Implemented 6 quick fixes (DAE error handling, RLS policies, doc redaction, all lint warnings, audit logging)
- Final state: 0 lint errors, 0 lint warnings, 77/80 tests pass
- 11 of 17 original issues resolved. 6 remain (all need decisions or are tied to Phase 2/launch)
