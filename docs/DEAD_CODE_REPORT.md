# Dead Code Report

> Generated: 2026-02-17 | Audit of `/home/ubuntu/lardia/src/`

## Summary

| Category | Count |
|----------|-------|
| Unused exported functions | 8 |
| Orphaned pages / components | 3 |
| Duplicate / redundant modules | 2 |
| Legacy aliases | 1 |

---

## 1. Unused Exported Functions (HIGH confidence)

These functions are exported but never imported or referenced anywhere outside their own file.

| Function | File | Confidence |
|----------|------|------------|
| `getReferralStats` | `src/lib/referral.ts` | 🔴 HIGH — 0 references |
| `buildS1000Xml` | `src/lib/esocial/api-client.ts` | 🔴 HIGH — 0 references |
| `ESOCIAL_ERROR_CODES` | `src/lib/esocial/api-client.ts` | 🔴 HIGH — 0 references |
| `validateCertificate` | `src/lib/esocial/certificate.ts` | 🔴 HIGH — 0 references |
| `loadCertificate` | `src/lib/esocial/certificate.ts` | 🔴 HIGH — 0 references |
| `signXml` | `src/lib/esocial/certificate.ts` | 🔴 HIGH — 0 references |
| `generateEventId` | `src/lib/esocial/api-client.ts` | 🔴 HIGH — 0 references |
| `shouldUseProxy` | `src/lib/esocial/api-client.ts` | 🔴 HIGH — 0 references |
| `EsocialApiClient` (class) | `src/lib/esocial/api-client.ts` | 🔴 HIGH — 0 instantiations |

**Note:** Email functions (`sendWelcomeEmail`, `sendDaeReminderEmail`, `sendPayrollProcessedEmail`, `sendGenericEmail`) are NOT dead code — they are pre-built infrastructure awaiting Resend integration (now verified). The `certificate.ts` functions are for eSocial mTLS signing — needed when direct API integration goes live.

---

## 2. Orphaned Pages & Components

| Item | File | Issue |
|------|------|-------|
| `ConectarESocialPage` | `src/app/dashboard/esocial/conectar/page.tsx` (340 lines) | **Orphan.** The dashboard links to `/dashboard/esocial/connect`, not `/conectar`. This is an older Portuguese-named duplicate of `connect/page.tsx`. |
| `ProxyHealthIndicator` | `src/app/dashboard/esocial/proxy-health-indicator.tsx` | **Orphan.** Exported but never imported by any page or component. |

---

## 3. Duplicate / Redundant Modules

| Files | Issue |
|-------|-------|
| `src/lib/calc/thirteenth-salary.ts` + `src/lib/calc/thirteenth.ts` | `thirteenth-salary.ts` is a re-export wrapper for `thirteenth.ts`. Only the test file `__tests__/thirteenth-salary.test.ts` imports from it. The barrel `calc/index.ts` imports from `thirteenth.ts` directly. The wrapper adds no value. |
| `src/app/dashboard/esocial/conectar/page.tsx` + `connect/page.tsx` | Two implementations of the same eSocial connection page. `connect/` is the active one; `conectar/` is dead. |

---

## 4. Legacy Code

| Item | File | Issue |
|------|------|-------|
| `auditLog` (legacy alias) | `src/lib/audit.ts` | Kept for backward compatibility, still used by 3 API routes. Should migrate callers to `logAudit` and remove. |

---

## 5. Low-Risk / Watch List

| Item | File | Notes |
|------|------|-------|
| `env.ts` `serverEnv.sentry.dsn` | `src/lib/env.ts` | Only used by Sentry config files, not via `serverEnv` import. |
| Entire `src/lib/esocial/certificate.ts` | Certificate signing module | Infrastructure ready for direct eSocial API — currently proxy-based. Keep if direct integration is planned. |
| Entire `src/lib/esocial/rpa-client.ts` | RPA/browser automation client | Only referenced in `dae/[id]/pdf/route.ts`. May be inactive infrastructure. |

---

## Methodology

- Grepped all `export` declarations across `src/`
- Cross-referenced each export with `grep -r` for import/usage references
- Excluded `node_modules`, `.next`, and test files from usage counts (except where noted)
- Manual review of link targets for page routes
