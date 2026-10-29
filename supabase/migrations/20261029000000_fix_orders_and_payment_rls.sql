-- ==============================================================================
-- THE CELEBRATION STORE — ORDERS & PAYMENT RLS SECURITY REINFORCEMENT
-- ==============================================================================
-- Migration Date: 2026-10-29
-- Project: TheCelebrationStore (ID: njbtlcdyknuwwltunfis)
--
-- Fixes:
-- 1. Ensure authenticated customers can create their own orders (user_id = auth.uid()).
-- 2. Ensure authenticated customers can log initial payment attempts for their orders.
-- 3. Maintain strict security boundaries so users can never view or modify others' orders.
-- ==============================================================================

-- 1. Orders table security check and policies
alter table public.orders enable row level security;

-- Customer insert policy: user can only insert an order with their own user_id
drop policy if exists "order own insert" on public.orders;
create policy "order own insert"
  on public.orders
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Customer select policy: user can only view their own orders
drop policy if exists "order own select" on public.orders;
create policy "order own select"
  on public.orders
  for select
  to authenticated
  using (user_id = auth.uid());

-- Order line items insert policy: customer can insert items for their own orders
alter table public.order_items enable row level security;

drop policy if exists "Customer insert own order items" on public.order_items;
create policy "Customer insert own order items"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "Customer read own order items" on public.order_items;
create policy "Customer read own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- 2. Payment attempts policies
alter table public.payment_attempts enable row level security;

-- Allow authenticated customer to record their initiated payment attempt
drop policy if exists "Customer insert own payment attempts" on public.payment_attempts;
create policy "Customer insert own payment attempts"
  on public.payment_attempts
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'initiated'
  );

-- Customer can read only their own payment attempts
drop policy if exists "Customer read own payment attempts" on public.payment_attempts;
create policy "Customer read own payment attempts"
  on public.payment_attempts
  for select
  to authenticated
  using (user_id = auth.uid());
