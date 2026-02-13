-- Lardia: Initial database schema
-- Employers, employees, payroll history

-- ============================================
-- EMPLOYERS (empregadores domésticos)
-- ============================================
create table public.employers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Personal data
  full_name text not null,
  cpf text not null, -- masked in API responses
  email text,
  phone text,
  
  -- Address (workplace)
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  
  -- Metadata
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Constraints
  unique(user_id) -- one employer profile per user
);

-- ============================================
-- EMPLOYEES (empregadas domésticas)
-- ============================================
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.employers(id) on delete cascade not null,
  
  -- Personal data
  full_name text not null,
  cpf text not null,
  birth_date date,
  race text, -- autodeclarado: branca, preta, parda, amarela, indígena
  marital_status text,
  education_level text,
  
  -- Address
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  
  -- Contract data
  role text not null default 'Empregado(a) doméstico(a) nos serviços gerais',
  admission_date date not null,
  contract_type text not null default 'indeterminate', -- indeterminate, fixed_term, experience
  experience_days integer, -- if contract_type = experience (15, 30, 45, 60, 90)
  salary numeric(10,2) not null,
  payment_frequency text not null default 'monthly', -- monthly, biweekly
  
  -- Work schedule
  schedule_type text not null default 'fixed', -- fixed, 12x36, other
  weekly_hours numeric(4,1) default 44,
  
  -- Status
  status text not null default 'active', -- active, on_vacation, on_leave, terminated
  termination_date date,
  termination_type text, -- sem_justa_causa, pedido_demissao, justa_causa, acordo
  
  -- Metadata
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================
-- SALARY HISTORY (histórico de salários)
-- ============================================
create table public.salary_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade not null,
  salary numeric(10,2) not null,
  effective_date date not null,
  reason text, -- reajuste_anual, promocao, acordo
  created_at timestamptz default now() not null
);

-- ============================================
-- PAYROLL CALCULATIONS (cálculos de folha)
-- ============================================
create table public.payroll_calculations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade not null,
  
  -- Period
  reference_month integer not null, -- 1-12
  reference_year integer not null,
  calculation_type text not null default 'monthly', -- monthly, vacation, thirteenth_1st, thirteenth_2nd, termination
  
  -- Input data (what the user entered)
  gross_salary numeric(10,2) not null,
  overtime_hours numeric(5,1) default 0,
  absence_days numeric(4,1) default 0,
  dsr_absence_days numeric(4,1) default 0,
  dependents integer default 0,
  
  -- Calculated values (stored for audit trail)
  -- Earnings
  overtime_pay numeric(10,2) default 0,
  total_earnings numeric(10,2) not null,
  
  -- Deductions
  inss_employee numeric(10,2) not null,
  irrf numeric(10,2) default 0,
  absence_deduction numeric(10,2) default 0,
  dsr_deduction numeric(10,2) default 0,
  other_deductions numeric(10,2) default 0,
  total_deductions numeric(10,2) not null,
  
  -- Net
  net_salary numeric(10,2) not null,
  
  -- Employer costs
  inss_employer numeric(10,2) not null,
  gilrat numeric(10,2) not null,
  fgts_monthly numeric(10,2) not null,
  fgts_anticipation numeric(10,2) not null,
  dae_total numeric(10,2) not null,
  
  -- Tax table version used
  tax_table_year integer not null,
  
  -- Status
  status text not null default 'draft', -- draft, confirmed, filed
  payment_date date,
  filed_at timestamptz,
  
  -- Metadata
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Prevent duplicate calculations for same period
  unique(employee_id, reference_month, reference_year, calculation_type)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.employers enable row level security;
alter table public.employees enable row level security;
alter table public.salary_history enable row level security;
alter table public.payroll_calculations enable row level security;

-- Employers: users can only see/edit their own profile
create policy "Users can view own employer profile"
  on public.employers for select
  using (auth.uid() = user_id);

create policy "Users can insert own employer profile"
  on public.employers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own employer profile"
  on public.employers for update
  using (auth.uid() = user_id);

-- Employees: users can only see/edit employees of their employer profile
create policy "Users can view own employees"
  on public.employees for select
  using (employer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

create policy "Users can insert own employees"
  on public.employees for insert
  with check (employer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

create policy "Users can update own employees"
  on public.employees for update
  using (employer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

create policy "Users can delete own employees"
  on public.employees for delete
  using (employer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

-- Salary history: same pattern
create policy "Users can view own salary history"
  on public.salary_history for select
  using (employee_id in (
    select e.id from public.employees e
    join public.employers emp on e.employer_id = emp.id
    where emp.user_id = auth.uid()
  ));

create policy "Users can insert own salary history"
  on public.salary_history for insert
  with check (employee_id in (
    select e.id from public.employees e
    join public.employers emp on e.employer_id = emp.id
    where emp.user_id = auth.uid()
  ));

-- Payroll calculations: same pattern
create policy "Users can view own payroll calculations"
  on public.payroll_calculations for select
  using (employee_id in (
    select e.id from public.employees e
    join public.employers emp on e.employer_id = emp.id
    where emp.user_id = auth.uid()
  ));

create policy "Users can insert own payroll calculations"
  on public.payroll_calculations for insert
  with check (employee_id in (
    select e.id from public.employees e
    join public.employers emp on e.employer_id = emp.id
    where emp.user_id = auth.uid()
  ));

create policy "Users can update own payroll calculations"
  on public.payroll_calculations for update
  using (employee_id in (
    select e.id from public.employees e
    join public.employers emp on e.employer_id = emp.id
    where emp.user_id = auth.uid()
  ));

-- ============================================
-- INDEXES
-- ============================================
create index idx_employers_user_id on public.employers(user_id);
create index idx_employees_employer_id on public.employees(employer_id);
create index idx_employees_status on public.employees(status);
create index idx_salary_history_employee_id on public.salary_history(employee_id);
create index idx_payroll_employee_period on public.payroll_calculations(employee_id, reference_year, reference_month);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.employers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.employees
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.payroll_calculations
  for each row execute function public.handle_updated_at();
