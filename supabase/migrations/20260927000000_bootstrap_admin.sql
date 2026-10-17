-- THE CELEBRATION STORE — PRODUCTION ADMIN BOOTSTRAP MIGRATION
-- Run automatically by Supabase CLI or manually in SQL Editor

create extension if not exists "pgcrypto";

do $$
declare
  admin_uid uuid;
  encrypted_pw text;
begin
  encrypted_pw := crypt('store@123', gen_salt('bf'));
  
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
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_uid,
      'authenticated',
      'authenticated',
      'thecelebrationstore@gmail.com',
      encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Store Administrator"}',
      now(),
      now()
    );
  else
    update auth.users
    set encrypted_password = encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = admin_uid;
  end if;

  insert into public.profiles (id, email, full_name, updated_at)
  values (admin_uid, 'thecelebrationstore@gmail.com', 'Store Administrator', now())
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (admin_uid, 'admin')
  on conflict do nothing;

  delete from public.user_roles where user_id = admin_uid and role = 'customer';
end $$;

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
  else
    insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  end if;

  return new;
end; $$;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
