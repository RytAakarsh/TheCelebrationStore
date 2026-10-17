-- ==============================================================================
-- THE CELEBRATION STORE — PRODUCTION ADMIN & AUTH BOOTSTRAP SCRIPT
-- ==============================================================================
-- Project: TheCelebrationStore (ID: njbtlcdyknuwwltunfis)
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/njbtlcdyknuwwltunfis/sql/new
--
-- This script fixes:
-- 1. All GoTrue scanner NULL-column issues in auth.users
-- 2. Inserts or updates the administrator identity in auth.identities
-- 3. Sets the verified password to 'store@123'
-- 4. Confirms the admin email
-- 5. Assigns the 'admin' role in public.user_roles
-- 6. Configures handle_new_user() trigger for future sign-ins/Google OAuth
-- 7. Configures product-images storage bucket and policies
-- ==============================================================================

create extension if not exists "pgcrypto";

do $$
declare
  admin_uid uuid;
  encrypted_pw text;
begin
  -- Generate bcrypt password hash for 'store@123'
  encrypted_pw := crypt('store@123', gen_salt('bf'));
  
  -- Check if user already exists in auth.users
  select id into admin_uid from auth.users where lower(email) = 'thecelebrationstore@gmail.com';
  
  if admin_uid is null then
    admin_uid := gen_random_uuid();
    
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_uid,
      'authenticated',
      'authenticated',
      'thecelebrationstore@gmail.com',
      encrypted_pw,
      now(),
      null,
      '',
      null,
      '',
      null,
      '',
      '',
      null,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Store Administrator"}',
      false,
      now(),
      now(),
      null,
      null,
      '',
      '',
      null,
      '',
      0,
      null,
      '',
      null,
      false,
      null
    );
  else
    -- Update existing user: FIX any NULL string columns that cause GoTrue 500 scan errors
    update auth.users
    set 
      encrypted_password = encrypted_pw,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      confirmation_token = coalesce(confirmation_token, ''),
      recovery_token = coalesce(recovery_token, ''),
      email_change_token_new = coalesce(email_change_token_new, ''),
      email_change = coalesce(email_change, ''),
      phone_change = coalesce(phone_change, ''),
      phone_change_token = coalesce(phone_change_token, ''),
      reauthentication_token = coalesce(reauthentication_token, ''),
      email_change_token_current = coalesce(email_change_token_current, ''),
      is_sso_user = coalesce(is_sso_user, false),
      email_change_confirm_status = coalesce(email_change_confirm_status, 0),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}',
      raw_user_meta_data = '{"full_name":"Store Administrator"}',
      updated_at = now()
    where id = admin_uid;
  end if;

  -- Ensure auth.identities has the email identity (CRITICAL: GoTrue requires this for password sign in)
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    admin_uid,
    json_build_object('sub', admin_uid::text, 'email', 'thecelebrationstore@gmail.com'),
    'email',
    admin_uid::text,
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do update set
    last_sign_in_at = now(),
    updated_at = now();

  -- Ensure public.profiles has the record
  insert into public.profiles (id, email, full_name, status, updated_at)
  values (admin_uid, 'thecelebrationstore@gmail.com', 'Store Administrator', 'active', now())
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    status = 'active',
    updated_at = now();

  -- Assign 'admin' role in public.user_roles
  insert into public.user_roles (user_id, role)
  values (admin_uid, 'admin')
  on conflict do nothing;

  delete from public.user_roles
  where user_id = admin_uid and role = 'customer';
end $$;

-- Auto-grant admin role if thecelebrationstore@gmail.com logs in via Google OAuth or registers
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    email = excluded.email,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  if lower(coalesce(new.email, '')) = 'thecelebrationstore@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
    delete from public.user_roles where user_id = new.id and role = 'customer';
  else
    insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  end if;

  return new;
end; $$;

-- Ensure storage bucket 'product-images' exists and is public for fast storefront asset delivery
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Ensure storage read and write policies
drop policy if exists "shop images read" on storage.objects;
create policy "shop images read" on storage.objects for select to authenticated, anon
  using (bucket_id = 'product-images');

drop policy if exists "shop images admin write" on storage.objects;
create policy "shop images admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "shop images admin update" on storage.objects;
create policy "shop images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "shop images admin delete" on storage.objects;
create policy "shop images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
