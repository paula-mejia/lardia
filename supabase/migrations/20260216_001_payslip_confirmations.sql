-- Payslip receipt confirmations via WhatsApp
create table public.payslip_confirmations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade not null,
  employer_id uuid references public.employers(id) on delete cascade not null,
  month text not null, -- YYYY-MM format
  confirmed_at timestamptz not null default now(),
  phone_number text not null,
  
  -- Prevent duplicate confirmations per employee per month
  unique(employee_id, month)
);

-- RLS
alter table public.payslip_confirmations enable row level security;

-- Employers can view confirmations for their employees
create policy "Employers can view their confirmations"
  on public.payslip_confirmations for select
  using (employer_id = auth.uid());

-- Service role inserts (webhook)
create policy "Service role can insert confirmations"
  on public.payslip_confirmations for insert
  with check (true);

-- Index for lookups
create index idx_payslip_confirmations_employee_month
  on public.payslip_confirmations(employee_id, month);

create index idx_payslip_confirmations_employer
  on public.payslip_confirmations(employer_id);
