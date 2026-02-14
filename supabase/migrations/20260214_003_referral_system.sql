-- Referral system: referral codes on employers + referrals table

-- Add referral_code to employers
alter table public.employers add column if not exists referral_code text unique;
alter table public.employers add column if not exists referral_bonus_months integer default 0;

-- Generate referral codes for existing employers
update public.employers
set referral_code = 'LARDIA-' || upper(substr(md5(random()::text), 1, 4))
where referral_code is null;

-- Referrals table
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.employers(id) on delete cascade not null,
  referee_id uuid references public.employers(id) on delete set null,
  referral_code text not null,
  status text not null default 'pending', -- pending, completed, rewarded
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

-- RLS
alter table public.referrals enable row level security;

create policy "Users can view own referrals as referrer"
  on public.referrals for select
  using (referrer_id in (
    select id from public.employers where user_id = auth.uid()
  ));

create policy "Users can view own referrals as referee"
  on public.referrals for select
  using (referee_id in (
    select id from public.employers where user_id = auth.uid()
  ));

-- Service role can insert/update (handled via API)
create policy "Service role can manage referrals"
  on public.referrals for all
  using (true)
  with check (true);

-- Indexes
create index idx_referrals_referrer_id on public.referrals(referrer_id);
create index idx_referrals_referee_id on public.referrals(referee_id);
create index idx_referrals_referral_code on public.referrals(referral_code);
create index idx_employers_referral_code on public.employers(referral_code);
