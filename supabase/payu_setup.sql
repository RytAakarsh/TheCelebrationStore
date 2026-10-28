-- ==============================================================================
-- THE CELEBRATION STORE — PAYU PAYMENT GATEWAY SETUP SCRIPT
-- ==============================================================================
-- Project: TheCelebrationStore (ID: njbtlcdyknuwwltunfis)
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/njbtlcdyknuwwltunfis/sql/new
-- ==============================================================================

create extension if not exists "pgcrypto";

-- 1. Extend site_settings table with gateway settings (if not already present)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'payu_enabled') then
    alter table public.site_settings add column payu_enabled boolean not null default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'payu_env') then
    alter table public.site_settings add column payu_env text not null default 'test' check (payu_env in ('test', 'live'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'payu_merchant_key') then
    alter table public.site_settings add column payu_merchant_key text default 'bEMOEW';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'payu_last_verified_at') then
    alter table public.site_settings add column payu_last_verified_at timestamptz;
  end if;
end $$;

-- 2. Create payment_attempts table
create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  txnid text not null unique,
  payu_payment_id text,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  environment text not null default 'test' check (environment in ('test', 'live')),
  status text not null default 'initiated' check (status in ('initiated', 'pending', 'success', 'failed', 'cancelled', 'refunded')),
  mode text,
  bank_ref_num text,
  error_code text,
  error_message text,
  response_hash text,
  raw_response jsonb,
  initiated_at timestamptz not null default now(),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance & quick lookup
create index if not exists idx_payment_attempts_order on public.payment_attempts(order_id);
create index if not exists idx_payment_attempts_user on public.payment_attempts(user_id);
create index if not exists idx_payment_attempts_txnid on public.payment_attempts(txnid);
create index if not exists idx_payment_attempts_payu_id on public.payment_attempts(payu_payment_id);
create index if not exists idx_payment_attempts_status on public.payment_attempts(status);

-- 3. Create payment_events table for sanitized audit logs
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_attempt_id uuid references public.payment_attempts(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  event_type text not null,
  source text not null,
  status text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_events_attempt on public.payment_events(payment_attempt_id);
create index if not exists idx_payment_events_order on public.payment_events(order_id);

-- 4. Enable Row Level Security (RLS)
alter table public.payment_attempts enable row level security;
alter table public.payment_events enable row level security;

-- Drop existing policies if any to prevent conflicts
drop policy if exists "Customer read own payment attempts" on public.payment_attempts;
drop policy if exists "Admin read all payment attempts" on public.payment_attempts;
drop policy if exists "Admin manage payment attempts" on public.payment_attempts;
drop policy if exists "Admin read all payment events" on public.payment_events;
drop policy if exists "Customer read own payment events" on public.payment_events;

-- Customer can read only their own payment attempts
create policy "Customer read own payment attempts"
  on public.payment_attempts
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Only admins can update or manage payment attempts
create policy "Admin manage payment attempts"
  on public.payment_attempts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Payment audit events policy
create policy "Admin read all payment events"
  on public.payment_events
  for select
  to authenticated
  using (public.is_admin());

create policy "Customer read own payment events"
  on public.payment_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = payment_events.order_id
      and o.user_id = auth.uid()
    )
  );

-- 5. Permissions & Grants
grant select on public.payment_attempts to authenticated;
grant select on public.payment_events to authenticated;
grant all on public.payment_attempts to service_role;
grant all on public.payment_events to service_role;

-- 6. Updated_at Trigger for payment_attempts
drop trigger if exists payment_attempts_updated on public.payment_attempts;
create trigger payment_attempts_updated
  before update on public.payment_attempts
  for each row execute function public.update_updated_at_column();
