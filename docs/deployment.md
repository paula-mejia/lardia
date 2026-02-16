# Deployment Guide

This document covers the full production infrastructure for Lardia.

## Architecture Overview

```
[Browser] → [Vercel (Next.js)] → [Supabase (DB/Auth)]
                ↓                       ↓
          [Stripe API]           [Resend (Email)]
                ↓
       [EC2 Proxy (São Paulo)] → [eSocial Gov API (mTLS)]
```

---

## 1. Vercel Deployment

### Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)
- **Node.js Version:** 22.x
- **Install Command:** `npm ci`

### Environment Variables

All required env vars are listed in `.env.example`. Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Type | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase service role key (server-only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Secret | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Secret | Stripe price ID for subscription |
| `NEXT_PUBLIC_SITE_URL` | Public | `https://lardia.com.br` |
| `ESOCIAL_PROXY_URL` | Secret | EC2 proxy URL (`https://api.lardia.com.br`) |
| `ESOCIAL_PROXY_API_KEY` | Secret | API key for proxy authentication |
| `RESEND_API_KEY` | Secret | Resend API key for transactional email |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | Sentry DSN for client-side error tracking |
| `SENTRY_DSN` | Secret | Sentry DSN for server-side error tracking |
| `NEXT_PUBLIC_GA4_ID` | Public | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_META_PIXEL_ID` | Public | Meta Pixel ID (optional) |
| `LARDIA_CNPJ` | Secret | Company CNPJ |

**Phase 2 (not yet active):**

| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender number |

### Domain Configuration

In **Vercel → Project → Settings → Domains**:

1. Add `lardia.com.br` (primary)
2. Add `www.lardia.com.br` (redirects to apex)
3. Vercel will provide the required DNS records (see DNS section below)

---

## 2. EC2 Proxy (São Paulo)

The eSocial government API requires mTLS (mutual TLS) with A1 digital certificates. Since Vercel's serverless functions cannot hold client certificates, an EC2 proxy in São Paulo handles mTLS termination.

### Instance Details

- **Region:** sa-east-1 (São Paulo)
- **IP:** `54.207.197.86`
- **OS:** Ubuntu
- **Purpose:** Forward eSocial API requests with mTLS client certificates

### SSH Access

```bash
ssh -i ~/.ssh/lardia-sp.pem ubuntu@54.207.197.86
```

### Systemd Service

The proxy runs as a systemd service called `esocial-proxy`:

```bash
# Status / logs
sudo systemctl status esocial-proxy
sudo journalctl -u esocial-proxy -f

# Restart
sudo systemctl restart esocial-proxy
```

### HTTPS (Let's Encrypt)

The proxy is accessible at `https://api.lardia.com.br` with SSL via Let's Encrypt:

```bash
# Certificate was provisioned with:
sudo certbot --nginx -d api.lardia.com.br

# Auto-renewal is handled by certbot's systemd timer:
sudo systemctl status certbot.timer
```

Certificates auto-renew before expiry. No manual intervention needed.

### Nginx Configuration

Nginx sits in front of the proxy process, handling:
- HTTPS termination (Let's Encrypt certificates)
- HTTP → HTTPS redirect
- Rate limiting
- API key validation via headers

### mTLS Certificate Setup

eSocial requires an **A1 digital certificate** (`.pfx` / `.p12`) issued by a Brazilian CA (ICP-Brasil). The proxy extracts the certificate and private key for mTLS handshake with the government endpoint.

Steps to update certificates:
1. Obtain a valid A1 certificate (`.pfx` file)
2. Upload to the EC2 instance
3. Extract cert and key (password-protected)
4. Update the proxy configuration to reference new cert paths
5. Restart the service: `sudo systemctl restart esocial-proxy`

### Health Check

```bash
curl https://api.lardia.com.br/health
```

### API Endpoints

The proxy exposes:
- `POST /esocial/producaorestrita/{path}` — Restricted production (testing)
- `POST /esocial/producao/{path}` — Production

All requests require the `X-API-Key` header matching `ESOCIAL_PROXY_API_KEY`.

---

## 3. Supabase

### Project Details

- **Project ID:** `kimxgwxoxgjcdtpvpzxl`
- **URL:** `https://kimxgwxoxgjcdtpvpzxl.supabase.co`
- **DB Version:** PostgreSQL 17
- **Dashboard:** https://supabase.com/dashboard/project/kimxgwxoxgjcdtpvpzxl

### Migrations

Migrations live in `supabase/migrations/` and are applied with:

```bash
npx supabase db push          # Push to remote
npx supabase db reset          # Reset local (applies migrations + seed)
npx supabase migration new <name>  # Create new migration
```

Current migrations:
- `20260213_001_initial_schema.sql` — Core tables
- `20260214151112_add_onboarding_completed.sql`
- `20260214163506_add_esocial_fields.sql`
- `20260214_001_notification_tables.sql`
- `20260214_002_whatsapp_fields.sql`
- `20260214_003_referral_system.sql`
- `20260215_001_stripe_subscriptions.sql`
- `20260215_002_esocial_events_dae.sql`
- `20260215_audit_logs_update.sql`
- `20260215_newsletter_add_columns.sql`

### Row Level Security (RLS)

RLS is enabled on all user-facing tables. Policies ensure:
- Users can only read/write their own data
- Service role key bypasses RLS (used server-side only)
- Public tables (e.g. newsletter) have insert-only policies

### Auth Configuration

In **Supabase Dashboard → Authentication → Settings**:

- **Auth method:** Password (default) + Magic link (secondary, requires working SMTP)
- **Autoconfirm:** Enabled (no email verification required for signup)
- **Site URL:** `https://lardia.com.br`
- **Redirect URLs:**
  - `https://lardia.com.br/**`
  - `https://www.lardia.com.br/**`
  - `http://localhost:3000/**` (development)
- **Custom SMTP:** Configured via Resend SMTP credentials for branded emails
  - Host: `smtp.resend.com`
  - Port: 465
  - Username: `resend`
  - Password: Resend API key

---

## 4. Stripe

### Test vs Live Mode

- **Test keys:** `pk_test_*` / `sk_test_*` — used in development and staging
- **Live keys:** `pk_live_*` / `sk_live_*` — used in production

Switch by updating the env vars in Vercel. Never mix test and live keys.

### Webhook Setup

In **Stripe Dashboard → Developers → Webhooks**:

- **Endpoint URL:** `https://lardia.com.br/api/stripe/webhook`
- **Events to listen for:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- **Signing secret:** Set as `STRIPE_WEBHOOK_SECRET` env var

### Price IDs

Set `STRIPE_PRICE_ID` to the appropriate Stripe Price ID for the subscription plan. Create prices in Stripe Dashboard → Products.

---

## 5. Resend (Email)

### Setup

- **API Key:** Set as `RESEND_API_KEY` env var
- **SDK:** `resend` npm package (v6.x)

### Domain Verification

In **Resend Dashboard → Domains**:

1. Add `lardia.com.br`
2. Add the required DNS records (SPF, DKIM, DMARC) at registro.br
3. Wait for verification (usually minutes)

This enables sending from `@lardia.com.br` addresses.

### Email Forwarding (ImprovMX)

Inbound email forwarding for `@lardia.com.br` is handled by **ImprovMX**:

- All emails to `*@lardia.com.br` are forwarded to the team Gmail
- Configured via MX records pointing to ImprovMX servers
- Free tier is sufficient for current volume

---

## 6. DNS (registro.br)

All DNS is managed at [registro.br](https://registro.br).

### Records

| Type | Name | Value | Purpose |
|---|---|---|---|
| A | `@` | `76.76.21.21` | Vercel (confirm in Vercel dashboard) |
| CNAME | `www` | `cname.vercel-dns.com` | Vercel www redirect |
| A | `api` | `54.207.197.86` | EC2 proxy (HTTPS via Let's Encrypt) |
| MX | `@` | ImprovMX MX servers | Email forwarding (@lardia.com.br → Gmail) |
| TXT | `@` | `v=spf1 include:spf.improvmx.com include:resend.com ~all` | SPF (ImprovMX + Resend) |
| CNAME | `resend._domainkey` | DKIM value from Resend | Resend DKIM authentication |
| TXT | `_dmarc` | `v=DMARC1; p=none; ...` | DMARC policy |

> **Note:** Verify the exact Vercel DNS values in the Vercel dashboard, as they may vary.

---

## 7. Monitoring

### Sentry

- **DSN:** Set as both `NEXT_PUBLIC_SENTRY_DSN` (client) and `SENTRY_DSN` (server)
- **Config files:**
  - `sentry.client.config.ts`
  - `sentry.server.config.ts`
  - `sentry.edge.config.ts`
- **Integration:** Via `@sentry/nextjs` (wraps `next.config.ts`)
- **Dashboard:** https://sentry.io (check org settings for project link)

### Google Analytics 4

- **Measurement ID:** Set as `NEXT_PUBLIC_GA4_ID` (e.g. `G-NQYYCLJ19D`)
- **Dashboard:** https://analytics.google.com

### Vercel Analytics

Built-in via `@vercel/analytics` and `@vercel/speed-insights` packages. No extra configuration needed — automatically active on Vercel deployments.
