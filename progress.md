# Project Progress - LarDia

## Current Status
All code review fixes committed and pushed to `main` (commit `4fe2621`, 2026-02-19). Lint: 0 errors, 0 warnings. Tests: 77 pass, 3 pre-existing failures. 11 of 17 original review issues resolved. 6 remain - all need product decisions or are tied to Phase 2/launch. App is NOT live yet; eSocial government connection still needs to be built.

## Git State
- **Last commit:** `4fe2621` on `main` - "fix: code review - security, data integrity, and lint cleanup"
- **30 files changed** in that commit (security fixes, data integrity, RLS migrations, lint cleanup, docs)
- **Uncommitted locally:** `docs/ARCHITECTURE.md` (pre-existing change, not from review) and `docs/knowledge-base/Calculadora_Emprego_Domestico_Brasil_2026.xlsx` (untracked Excel file)

## Recently Completed

### All Code Review Fixes (2026-02-19) - COMMITTED & PUSHED

**Fix 1: Hardcoded credentials removed from test script**
- `scripts/test-esocial-api.ts` - all credentials now from env vars with validation
- `.env.example` updated with 6 new eSocial test vars
- `.gitignore` updated with `/tmp/`

**Fix 2: Invalid status values fixed**
- `src/app/api/esocial/events/[id]/retry/route.ts` - `'erro'` -> `'rejected'`, `'pendente'` -> `'draft'`
- `src/app/api/esocial/process/route.ts` - `'pending'` -> `'draft'`, removed premature `submitted_at`

**Fix 3: Monthly processor fixed**
- `src/lib/esocial/monthly-processor.ts` - events now start as `'draft'` (not premature `'accepted'`), removed `submittedAt` assignments

**Fix 4: Payslip confirmation RLS tightened**
- `src/app/api/payslip/confirm/route.ts` - switched to service role client (bypasses RLS)
- `supabase/migrations/20260219_001_fix_payslip_rls.sql` - drops `using(true)`, adds employer-scoped SELECT

**Fix 5: Status page proxy path corrected**
- `src/app/dashboard/esocial/status/page.tsx` - `/api/esocial/test` -> `/health`

**Fix #9: DAE insert errors now surface to the user**
- `src/app/api/esocial/process/route.ts` - added `warnings` field to response, removed unused `getClientIp`

**Fix #10: UPDATE/DELETE RLS policies added**
- `supabase/migrations/20260219_002_esocial_dae_update_delete_policies.sql`
- UPDATE and DELETE policies for both `esocial_events` and `dae_records`

**Fix #11: Sensitive info redacted from docs**
- `docs/deployment.md` and `LARDIA-STATUS.md` - replaced IPs, project IDs, keys, emails, CNPJ with placeholders

**Fix #14: All 23 lint warnings fixed (now 0 errors, 0 warnings)**
- Removed unused imports/variables across 13+ files

**Fix #16: Newsletter endpoint reviewed - kept as-is**
- Service role key is intentional for upsert pattern (re-subscribe)

**Fix #17: Audit logging non-null assertions fixed**
- `src/lib/audit.ts` - null-safe env var checks, `getServiceSupabase()` returns null if missing

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
- Certificate password, CNPJ, CPF are in git history (removed from code but still in commits)
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
- `docs/ARCHITECTURE.md` left uncommitted - pre-existing change, not from code review

## Session Log
### 2026-02-18
- Comprehensive 6-dimension code review (17 issues found)
- Cross-checked against second model's review (corrected proxy path assessment)

### 2026-02-18 (evening - Paula solo)
- 20 commits: landing page redesign, simulador overhaul, pricing toggle
- All deployed to Vercel

### 2026-02-19
- Pulled 20 new commits, cross-validated reviews, updated progress.md
- Implemented top 5 critical fixes (credentials, status values, monthly processor, RLS, proxy path)
- Implemented 6 quick fixes (DAE error handling, RLS policies, doc redaction, all lint warnings, audit logging)
- Final state: 0 lint errors, 0 lint warnings, 77/80 tests pass
- 11 of 17 original issues resolved. 6 remain (all need decisions or are tied to Phase 2/launch)
- All fixes committed and pushed to `main` as commit `4fe2621`

## Next Steps
- [ ] Decide on rate limiter solution (#2) before launch
- [ ] Product decision on subscription enforcement (#8) before launch
- [ ] Check Brazilian labor law for 13th salary day-16 rule (3 test failures)
- [ ] Rotate credentials before connecting to eSocial production
- [ ] Build actual eSocial government connection (the big missing piece)
- [ ] Paula: create Twilio account for WhatsApp Phase 2
- [ ] Paula: create Bright Data account for VPN residential proxy
