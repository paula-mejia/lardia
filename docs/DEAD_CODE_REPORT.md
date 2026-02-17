# Dead Code Report

> Generated: 2026-02-17 | Audit of `/home/ubuntu/lardia/src/`
> Updated: 2026-02-17 (cleanup applied)

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Dead code removed | 3 | ✅ Cleaned |
| WIP infrastructure (keep) | 9 | ✅ Reviewed, not dead code |

---

## Cleaned (2026-02-17)

| Item | Action | Details |
|------|--------|---------|
| `conectar/page.tsx` (340 lines) | **Deleted** | Duplicate of `connect/page.tsx`. No links pointed to it. |
| `thirteenth-salary.ts` wrapper | **Deleted** | Unnecessary re-export of `thirteenth.ts`. Test updated to import directly. |
| `auditLog` legacy alias | **Removed** | 3 API routes migrated to `logAudit` with correct signature. Legacy function deleted from `audit.ts`. |

---

## WIP Infrastructure (NOT dead code)

These functions have 0 current references but are pre-built infrastructure for features in progress:

| Function | File | Why it stays |
|----------|------|-------------|
| `sendWelcomeEmail` | `src/lib/email.ts` | Resend integration now verified. Will connect to onboarding flow. |
| `sendDaeReminderEmail` | `src/lib/email.ts` | Monthly processing email notifications. |
| `sendPayrollProcessedEmail` | `src/lib/email.ts` | Monthly processing email notifications. |
| `sendGenericEmail` | `src/lib/email.ts` | General-purpose email sender. |
| `getReferralStats` | `src/lib/referral.ts` | Referral dashboard (planned). |
| `buildS1000Xml` / `EsocialApiClient` / `generateEventId` / `shouldUseProxy` / `ESOCIAL_ERROR_CODES` | `src/lib/esocial/api-client.ts` | Direct eSocial API integration (backup to RPA strategy). |
| `validateCertificate` / `loadCertificate` / `signXml` | `src/lib/esocial/certificate.ts` | eCNPJ certificate operations for XML signing. Already tested. |
| `ProxyHealthIndicator` | `src/app/dashboard/esocial/proxy-health-indicator.tsx` | Dashboard widget for eSocial proxy status. |
| `rpa-client.ts` | `src/lib/esocial/rpa-client.ts` | Core RPA client for EC2 Playwright automation. |

---

## Methodology

- Grepped all `export` declarations across `src/`
- Cross-referenced each export with `grep -r` for import/usage
- Manual review with project context (roadmap, WIP features)
- Verified cleanup with `npx tsc --noEmit` (0 errors) and `npx vitest run` (69/69 passed)
