-- Add token column to payslip_confirmations for web-based confirmation
alter table public.payslip_confirmations
  add column if not exists token text unique,
  add column if not exists created_at timestamptz not null default now(),
  alter column confirmed_at drop not null,
  alter column confirmed_at set default null,
  alter column phone_number drop not null;

-- Add whatsapp_phone to employees
alter table public.employees
  add column if not exists whatsapp_phone text;

-- Index for fast token lookup
create index if not exists idx_payslip_confirmations_token
  on public.payslip_confirmations(token);

-- Allow public read/update by token for the confirmation page
drop policy if exists "Employers can view their confirmations" on public.payslip_confirmations;

create policy "Anyone can read confirmations"
  on public.payslip_confirmations for select
  using (true);

create policy "Anyone can update confirmations"
  on public.payslip_confirmations for update
  using (true)
  with check (true);
