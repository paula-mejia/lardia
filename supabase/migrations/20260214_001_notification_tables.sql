-- Notification preferences and log tables for eSocial deadline reminders

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.employers(id) on delete cascade not null,
  email_reminders boolean not null default true,
  days_before integer not null default 3,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(employer_id)
);

-- ============================================
-- NOTIFICATION LOG
-- ============================================
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.employers(id) on delete cascade not null,
  deadline_type text not null,
  deadline_date date not null,
  sent_at timestamptz default now() not null
);

-- Prevent duplicate notifications
create unique index idx_notification_log_unique
  on public.notification_log(employer_id, deadline_type, deadline_date);

create index idx_notification_log_employer
  on public.notification_log(employer_id);

-- ============================================
-- RLS
-- ============================================
alter table public.notification_preferences enable row level security;
alter table public.notification_log enable row level security;

create policy "Users can view own notification preferences"
  on public.notification_preferences for select
  using (employer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (employer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (employer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

create policy "Users can view own notification log"
  on public.notification_log for select
  using (employer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

-- Service role can insert notification logs (edge function)
create policy "Service role can insert notification log"
  on public.notification_log for insert
  with check (true);

-- Updated at trigger
create trigger set_updated_at before update on public.notification_preferences
  for each row execute function public.handle_updated_at();
