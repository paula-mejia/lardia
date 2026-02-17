# Cleanup Plan

> Prioritized action items from the 2026-02-17 housekeeping audit.

## Priority 1: Quick Wins (Low risk, high clarity)

### 1.1 Remove orphaned `conectar` page
- **File:** `src/app/dashboard/esocial/conectar/page.tsx` (340 lines)
- **Action:** Delete. The active page is `connect/page.tsx`. No links point to `/conectar`.
- **Risk:** None — it's a Next.js route that nobody navigates to.

### 1.2 Remove `thirteenth-salary.ts` re-export wrapper
- **File:** `src/lib/calc/thirteenth-salary.ts`
- **Action:** Delete wrapper. Update `__tests__/thirteenth-salary.test.ts` to import from `./thirteenth` instead.
- **Risk:** Minimal — only one test file imports from it.

### 1.3 Delete orphaned `ProxyHealthIndicator`
- **File:** `src/app/dashboard/esocial/proxy-health-indicator.tsx`
- **Action:** Delete. Never imported anywhere.

### 1.4 Migrate `auditLog` → `logAudit`
- **Files:** 3 API routes use `auditLog`; switch to `logAudit` for consistency.
- **Then:** Remove the `auditLog` legacy alias from `src/lib/audit.ts`.

---

## Priority 2: Dead Code Cleanup (Medium confidence)

### 2.1 Email templates in `src/lib/email.ts`
- `sendWelcomeEmail`, `sendDaeReminderEmail`, `sendPayrollProcessedEmail`, `sendGenericEmail` — all unused.
- **Decision needed:** Are these planned for integration? If yes, keep. If no, remove.
- **Recommendation:** Keep but add `// TODO: integrate with signup flow / cron job` comments.

### 2.2 Unused eSocial functions in `api-client.ts`
- `buildS1000Xml`, `ESOCIAL_ERROR_CODES`, `generateEventId`, `shouldUseProxy`, `EsocialApiClient` class
- **Context:** These are for direct eSocial API integration (vs. proxy). Infrastructure code.
- **Recommendation:** Keep if direct integration is planned. Otherwise, extract to a `_direct-api.ts` file to signal they're not active.

### 2.3 Unused certificate functions
- `loadCertificate`, `signXml`, `validateCertificate` in `certificate.ts`
- **Same as above:** infrastructure for direct mTLS. Keep if planned.

### 2.4 `getReferralStats` in `referral.ts`
- Exported but never called. Likely intended for the referral dashboard page.
- **Action:** Wire it up in `src/app/dashboard/referral/page.tsx` or remove.

---

## Priority 3: File Splitting (Large files)

Files exceeding 300 lines that would benefit from splitting:

| File | Lines | Suggestion |
|------|-------|------------|
| `src/lib/esocial/api-client.ts` | 643 | Split into: `api-client.ts` (EsocialApiClient), `proxy-client.ts` (EsocialProxyClient), `xml-builders.ts` (envelope functions), `constants.ts` (error codes, endpoints) |
| `src/app/simulador/simulador-client.tsx` | 578 | Extract calculator logic into a hook; split form sections into sub-components |
| `src/app/dashboard/esocial/process/page.tsx` | 529 | Extract step components, summary card, processing logic |
| `src/app/dashboard/background-check/page.tsx` | 493 | Extract form, results display, status components |
| `src/components/payroll-calculator.tsx` | 475 | Extract into sub-components (form, results, actions) |
| `src/app/dashboard/employees/[id]/termination/termination-page-client.tsx` | 474 | Extract form sections, calculation display |
| `src/app/dashboard/onboarding/page.tsx` | 465 | Extract step components |
| `src/app/dashboard/contracts/new/page.tsx` | 444 | Extract form steps |
| `src/lib/esocial/rpa-client.ts` | 432 | Acceptable for a client class, but could extract types |
| `src/lib/calc/termination.ts` | 382 | Acceptable — complex domain logic benefits from colocation |
| `src/lib/pdf/employment-contract.ts` | 376 | Acceptable — PDF layout code is inherently verbose |

---

## Priority 4: Naming & Consistency

### 4.1 Page naming: `conectar` vs `connect`
- Convention is English file/folder names. `conectar/` violates this (and is dead code anyway).

### 4.2 Referral link domain
- `src/lib/referral.ts` hardcodes `lardia.vercel.app` instead of `lardia.com.br`.
- **Action:** Use `env.siteUrl` or `NEXT_PUBLIC_SITE_URL`.

### 4.3 Dual audit functions
- `logAudit` (new) vs `auditLog` (legacy) — consolidate to one.

---

## Priority 5: Documentation (Done in this audit)

- ✅ JSDoc added to functions missing documentation
- ✅ `docs/ARCHITECTURE.md` created
- ✅ `docs/DEAD_CODE_REPORT.md` created
- ✅ `docs/HOUSEKEEPING_REPORT.md` created
- ✅ `README.md` reviewed (already comprehensive)
