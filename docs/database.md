# Lardia — Database Schema

> Auto-generated documentation based on Supabase migration files.
> Last updated: 2026-02-15

## Table of Contents

- [Enums & Custom Types](#enums--custom-types)
- [Tables](#tables)
  - [employers](#employers)
  - [employees](#employees)
  - [salary_history](#salary_history)
  - [payroll_calculations](#payroll_calculations)
  - [notification_preferences](#notification_preferences)
  - [notification_log](#notification_log)
  - [referrals](#referrals)
  - [esocial_events](#esocial_events)
  - [dae_records](#dae_records)
  - [audit_logs](#audit_logs)
  - [newsletter_subscribers](#newsletter_subscribers)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Indexes](#indexes)
- [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
- [Triggers](#triggers)

---

## Enums & Custom Types

| Type | Values | Used In |
|------|--------|---------|
| `subscription_status` | `trialing`, `active`, `past_due`, `canceled`, `none` | `employers.subscription_status` |

Several columns use **text with conventions** rather than enums:

| Column | Table | Allowed Values |
|--------|-------|---------------|
| `contract_type` | employees | `indeterminate`, `fixed_term`, `experience` |
| `payment_frequency` | employees | `monthly`, `biweekly` |
| `schedule_type` | employees | `fixed`, `12x36`, `other` |
| `status` | employees | `active`, `on_vacation`, `on_leave`, `terminated` |
| `termination_type` | employees | `sem_justa_causa`, `pedido_demissao`, `justa_causa`, `acordo` |
| `calculation_type` | payroll_calculations | `monthly`, `vacation`, `thirteenth_1st`, `thirteenth_2nd`, `termination` |
| `status` | payroll_calculations | `draft`, `confirmed`, `filed` |
| `race` | employees | `branca`, `preta`, `parda`, `amarela`, `indígena` |
| `status` | esocial_events | `draft`, `submitted`, `accepted`, `rejected` (CHECK constraint) |
| `status` | dae_records | `generated`, `paid`, `overdue` (CHECK constraint) |
| `status` | referrals | `pending`, `completed`, `rewarded` |

---

## Tables

### employers

The central user-facing entity. One employer profile per authenticated user.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `user_id` | uuid | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL, UNIQUE |
| `full_name` | text | NOT NULL |
| `cpf` | text | NOT NULL (masked in API) |
| `email` | text | |
| `phone` | text | |
| `cep` | text | |
| `street` | text | |
| `number` | text | |
| `complement` | text | |
| `neighborhood` | text | |
| `city` | text | |
| `state` | text | |
| `esocial_connected` | boolean | DEFAULT false |
| `esocial_connected_at` | timestamptz | |
| `esocial_cpf` | text | |
| `gov_br_verified` | boolean | DEFAULT false |
| `referral_code` | text | UNIQUE |
| `referral_bonus_months` | integer | DEFAULT 0 |
| `stripe_customer_id` | text | |
| `subscription_status` | subscription_status | NOT NULL, DEFAULT `'none'` |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` |
| `updated_at` | timestamptz | NOT NULL, DEFAULT `now()` |

### employees

Domestic workers linked to an employer.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `employer_id` | uuid | FK → `employers(id)` ON DELETE CASCADE, NOT NULL |
| `full_name` | text | NOT NULL |
| `cpf` | text | NOT NULL |
| `birth_date` | date | |
| `race` | text | |
| `marital_status` | text | |
| `education_level` | text | |
| `cep` | text | |
| `street` | text | |
| `number` | text | |
| `complement` | text | |
| `neighborhood` | text | |
| `city` | text | |
| `state` | text | |
| `role` | text | NOT NULL, DEFAULT `'Empregado(a) doméstico(a) nos serviços gerais'` |
| `admission_date` | date | NOT NULL |
| `contract_type` | text | NOT NULL, DEFAULT `'indeterminate'` |
| `experience_days` | integer | |
| `salary` | numeric(10,2) | NOT NULL |
| `payment_frequency` | text | NOT NULL, DEFAULT `'monthly'` |
| `schedule_type` | text | NOT NULL, DEFAULT `'fixed'` |
| `weekly_hours` | numeric(4,1) | DEFAULT 44 |
| `status` | text | NOT NULL, DEFAULT `'active'` |
| `termination_date` | date | |
| `termination_type` | text | |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` |
| `updated_at` | timestamptz | NOT NULL, DEFAULT `now()` |

### salary_history

Tracks salary changes over time per employee.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `employee_id` | uuid | FK → `employees(id)` ON DELETE CASCADE, NOT NULL |
| `salary` | numeric(10,2) | NOT NULL |
| `effective_date` | date | NOT NULL |
| `reason` | text | e.g. `reajuste_anual`, `promocao`, `acordo` |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` |

### payroll_calculations

Monthly payroll computations with full breakdown of earnings, deductions, and employer costs.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `employee_id` | uuid | FK → `employees(id)` ON DELETE CASCADE, NOT NULL |
| `reference_month` | integer | NOT NULL (1–12) |
| `reference_year` | integer | NOT NULL |
| `calculation_type` | text | NOT NULL, DEFAULT `'monthly'` |
| `gross_salary` | numeric(10,2) | NOT NULL |
| `overtime_hours` | numeric(5,1) | DEFAULT 0 |
| `absence_days` | numeric(4,1) | DEFAULT 0 |
| `dsr_absence_days` | numeric(4,1) | DEFAULT 0 |
| `dependents` | integer | DEFAULT 0 |
| `overtime_pay` | numeric(10,2) | DEFAULT 0 |
| `total_earnings` | numeric(10,2) | NOT NULL |
| `inss_employee` | numeric(10,2) | NOT NULL |
| `irrf` | numeric(10,2) | DEFAULT 0 |
| `absence_deduction` | numeric(10,2) | DEFAULT 0 |
| `dsr_deduction` | numeric(10,2) | DEFAULT 0 |
| `other_deductions` | numeric(10,2) | DEFAULT 0 |
| `total_deductions` | numeric(10,2) | NOT NULL |
| `net_salary` | numeric(10,2) | NOT NULL |
| `inss_employer` | numeric(10,2) | NOT NULL |
| `gilrat` | numeric(10,2) | NOT NULL |
| `fgts_monthly` | numeric(10,2) | NOT NULL |
| `fgts_anticipation` | numeric(10,2) | NOT NULL |
| `dae_total` | numeric(10,2) | NOT NULL |
| `tax_table_year` | integer | NOT NULL |
| `status` | text | NOT NULL, DEFAULT `'draft'` |
| `payment_date` | date | |
| `filed_at` | timestamptz | |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` |
| `updated_at` | timestamptz | NOT NULL, DEFAULT `now()` |

**Unique constraint:** `(employee_id, reference_month, reference_year, calculation_type)`

### notification_preferences

Per-employer settings for deadline reminders.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `employer_id` | uuid | FK → `employers(id)` ON DELETE CASCADE, NOT NULL, UNIQUE |
| `email_reminders` | boolean | NOT NULL, DEFAULT true |
| `days_before` | integer | NOT NULL, DEFAULT 3 |
| `whatsapp_number` | text | |
| `whatsapp_reminders` | boolean | NOT NULL, DEFAULT false |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` |
| `updated_at` | timestamptz | NOT NULL, DEFAULT `now()` |

### notification_log

Record of sent notifications (prevents duplicates).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `employer_id` | uuid | FK → `employers(id)` ON DELETE CASCADE, NOT NULL |
| `deadline_type` | text | NOT NULL |
| `deadline_date` | date | NOT NULL |
| `sent_at` | timestamptz | DEFAULT `now()`, NOT NULL |

**Unique constraint:** `(employer_id, deadline_type, deadline_date)`

### referrals

Tracks referral invitations between employers.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `referrer_id` | uuid | FK → `employers(id)` ON DELETE CASCADE, NOT NULL |
| `referee_id` | uuid | FK → `employers(id)` ON DELETE SET NULL |
| `referral_code` | text | NOT NULL |
| `status` | text | NOT NULL, DEFAULT `'pending'` |
| `created_at` | timestamptz | DEFAULT `now()`, NOT NULL |
| `completed_at` | timestamptz | |

### esocial_events

eSocial XML event submissions linked to employer/employee.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `employer_id` | uuid | FK → `employers(id)` ON DELETE CASCADE, NOT NULL |
| `employee_id` | uuid | FK → `employees(id)` ON DELETE SET NULL |
| `event_type` | text | NOT NULL |
| `event_data` | jsonb | NOT NULL, DEFAULT `'{}'` |
| `status` | text | NOT NULL, DEFAULT `'draft'`, CHECK in (`draft`,`submitted`,`accepted`,`rejected`) |
| `reference_month` | integer | NOT NULL, CHECK 1–12 |
| `reference_year` | integer | NOT NULL, CHECK ≥ 2020 |
| `created_at` | timestamptz | DEFAULT `now()` |
| `submitted_at` | timestamptz | |
| `response_data` | jsonb | |

### dae_records

DAE (Documento de Arrecadação do eSocial) payment slips.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `employer_id` | uuid | FK → `employers(id)` ON DELETE CASCADE, NOT NULL |
| `reference_month` | integer | NOT NULL, CHECK 1–12 |
| `reference_year` | integer | NOT NULL, CHECK ≥ 2020 |
| `total_amount` | numeric(12,2) | NOT NULL |
| `due_date` | date | NOT NULL |
| `status` | text | NOT NULL, DEFAULT `'generated'`, CHECK in (`generated`,`paid`,`overdue`) |
| `barcode` | text | |
| `breakdown` | jsonb | |
| `employees` | jsonb | |
| `generated_at` | timestamptz | DEFAULT `now()` |
| `paid_at` | timestamptz | |

### audit_logs

System audit trail. Base table created outside migrations; columns added via migration.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `user_id` | uuid | |
| `employer_id` | uuid | |
| `action` | text | NOT NULL |
| `resource` | text | |
| `ip_address` | text | |
| `user_agent` | text | |
| `details` | jsonb | DEFAULT `'{}'` |
| `metadata` | jsonb | DEFAULT `'{}'` |
| `created_at` | timestamptz | DEFAULT `now()` |

### newsletter_subscribers

Email newsletter sign-ups. Base table created outside migrations.

| Column | Type | Notes |
|--------|------|-------|
| `email` | text | (assumed PK or unique) |
| `name` | text | |
| `status` | text | NOT NULL, DEFAULT `'active'` |
| `unsubscribed_at` | timestamptz | |
| `created_at` | timestamptz | NOT NULL, DEFAULT `now()` |
| `lgpd_consent_at` | timestamptz | LGPD compliance timestamp |

---

## Entity Relationship Diagram

```
auth.users
    │
    │ 1:1  (user_id)
    ▼
┌──────────────┐
│  employers   │
└──────┬───────┘
       │
       ├──── 1:N ──── employees
       │                  │
       │                  ├── 1:N ── salary_history
       │                  ├── 1:N ── payroll_calculations
       │                  └── 0:N ── esocial_events (employee_id nullable)
       │
       ├──── 1:1 ──── notification_preferences
       ├──── 1:N ──── notification_log
       ├──── 1:N ──── esocial_events (employer_id)
       ├──── 1:N ──── dae_records
       ├──── 1:N ──── referrals (as referrer)
       └──── 0:N ──── referrals (as referee)
```

---

## Indexes

| Index Name | Table | Column(s) |
|------------|-------|-----------|
| `idx_employers_user_id` | employers | `user_id` |
| `idx_employers_referral_code` | employers | `referral_code` |
| `idx_employees_employer_id` | employees | `employer_id` |
| `idx_employees_status` | employees | `status` |
| `idx_salary_history_employee_id` | salary_history | `employee_id` |
| `idx_payroll_employee_period` | payroll_calculations | `(employee_id, reference_year, reference_month)` |
| `idx_notification_log_unique` | notification_log | `(employer_id, deadline_type, deadline_date)` UNIQUE |
| `idx_notification_log_employer` | notification_log | `employer_id` |
| `idx_referrals_referrer_id` | referrals | `referrer_id` |
| `idx_referrals_referee_id` | referrals | `referee_id` |
| `idx_referrals_referral_code` | referrals | `referral_code` |
| `idx_esocial_events_employer` | esocial_events | `employer_id` |
| `idx_esocial_events_period` | esocial_events | `(reference_year, reference_month)` |
| `idx_esocial_events_type` | esocial_events | `event_type` |
| `idx_dae_records_employer` | dae_records | `employer_id` |
| `idx_dae_records_period` | dae_records | `(reference_year, reference_month)` |
| `idx_audit_logs_user_id` | audit_logs | `user_id` |
| `idx_audit_logs_action` | audit_logs | `action` |
| `idx_audit_logs_created_at` | audit_logs | `created_at DESC` |

---

## Row Level Security (RLS) Policies

All main tables have RLS enabled. The pattern is consistent: **users can only access data belonging to their own employer profile** (resolved via `auth.uid() → employers.user_id`).

### employers

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own employer profile | SELECT | `user_id = auth.uid()` |
| Users can insert own employer profile | INSERT | `user_id = auth.uid()` |
| Users can update own employer profile | UPDATE | `user_id = auth.uid()` |

### employees

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own employees | SELECT | `employer_id` belongs to user's employer |
| Users can insert own employees | INSERT | Same check |
| Users can update own employees | UPDATE | Same check |
| Users can delete own employees | DELETE | Same check |

### salary_history

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own salary history | SELECT | `employee_id → employer_id` belongs to user |
| Users can insert own salary history | INSERT | Same check |

### payroll_calculations

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own payroll calculations | SELECT | `employee_id → employer_id` belongs to user |
| Users can insert own payroll calculations | INSERT | Same check |
| Users can update own payroll calculations | UPDATE | Same check |

### notification_preferences

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view/insert/update | SELECT/INSERT/UPDATE | `employer_id` belongs to user |

### notification_log

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own notification log | SELECT | `employer_id` belongs to user |
| Service role can insert notification log | INSERT | `with check (true)` — allows edge functions to write |

### referrals

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own referrals as referrer | SELECT | `referrer_id` belongs to user |
| Users can view own referrals as referee | SELECT | `referee_id` belongs to user |
| Service role can manage referrals | ALL | `true` — full access for backend |

### esocial_events

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view/insert own esocial events | SELECT/INSERT | `employer_id` belongs to user |

### dae_records

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view/insert own dae records | SELECT/INSERT | `employer_id` belongs to user |

---

## Triggers

| Trigger | Table | Function | Description |
|---------|-------|----------|-------------|
| `set_updated_at` | employers | `handle_updated_at()` | Auto-sets `updated_at = now()` on UPDATE |
| `set_updated_at` | employees | `handle_updated_at()` | Same |
| `set_updated_at` | payroll_calculations | `handle_updated_at()` | Same |
| `set_updated_at` | notification_preferences | `handle_updated_at()` | Same |

---

## Migration Files

| File | Description |
|------|-------------|
| `20260213_001_initial_schema.sql` | Core tables: employers, employees, salary_history, payroll_calculations + RLS + indexes + triggers |
| `20260214151112_add_onboarding_completed.sql` | eSocial fields on employers (esocial_connected, gov_br_verified) |
| `20260214163506_add_esocial_fields.sql` | (Empty / duplicate of above) |
| `20260214_001_notification_tables.sql` | notification_preferences + notification_log tables |
| `20260214_002_whatsapp_fields.sql` | WhatsApp columns on notification_preferences |
| `20260214_003_referral_system.sql` | Referral codes on employers + referrals table |
| `20260215_001_stripe_subscriptions.sql` | subscription_status enum + Stripe fields on employers |
| `20260215_002_esocial_events_dae.sql` | esocial_events + dae_records tables |
| `20260215_audit_logs_update.sql` | Adds columns/indexes to audit_logs |
| `20260215_newsletter_add_columns.sql` | Adds columns to newsletter_subscribers |
