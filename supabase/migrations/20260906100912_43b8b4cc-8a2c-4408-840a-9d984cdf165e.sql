-- ===== helpers =====
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create type public.app_role as enum ('admin','customer');

-- ===== profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  status text not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

-- first-admin claim: only works while no admin exists
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles(user_id, role) values (uid,'admin') on conflict do nothing;
  return true;
end; $$;
grant execute on function public.claim_first_admin() to authenticated;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin');
$$;
grant execute on function public.admin_exists() to authenticated, anon;

create policy "profiles own read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles own insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "roles read own" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create trigger profiles_updated before update on public.profiles for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.email,
          new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ===== catalog =====
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  banner_url text,
  icon text,
  accent text default 'pink',
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  image_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  brand text,
  short_description text,
  description text,
  mrp numeric(10,2) not null default 0,
  price numeric(10,2) not null default 0,
  moq int not null default 1,
  stock int not null default 0,
  low_stock_threshold int not null default 5,
  track_inventory boolean not null default true,
  allow_backorder boolean not null default false,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_trending boolean not null default false,
  is_published boolean not null default true,
  is_archived boolean not null default false,
  rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  sold_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products (category_id);
create index on public.products (is_published);
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  position int not null default 0,
  is_primary boolean not null default false
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  color_name text,
  color_hex text,
  sku text,
  price numeric(10,2),
  mrp numeric(10,2),
  stock int not null default 0,
  moq int not null default 1,
  description text,
  is_active boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create table public.variant_images (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  url text not null,
  position int not null default 0
);

-- ===== marketing =====
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  banner_url text,
  discount_type text not null default 'percent',
  discount_value numeric(10,2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.offer_products (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  unique (offer_id, product_id)
);
create table public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  heading text,
  subheading text,
  cta_text text,
  cta_link text,
  desktop_image_url text,
  mobile_image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.home_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  subtitle text,
  source text not null default 'category',
  category_id uuid references public.categories(id) on delete set null,
  display_order int not null default 0,
  is_active boolean not null default true
);
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent',
  discount_value numeric(10,2) not null default 0,
  min_cart_value numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int,
  per_user_limit int default 1,
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.site_settings (
  id int primary key default 1,
  brand_name text not null default 'Vizag Party World',
  tagline text not null default 'Make Every Moment Special',
  logo_url text,
  email text not null default 'vizagpartyworld@gmail.com',
  phone text not null default '8019926065',
  whatsapp text not null default '8019926065',
  address text not null default 'Party World, Poorna Market, Visakhapatnam - 530001, Andhra Pradesh, India',
  shipping_charge numeric(10,2) not null default 79,
  free_shipping_threshold numeric(10,2) not null default 999,
  cod_enabled boolean not null default true,
  online_payment_enabled boolean not null default false,
  instagram_url text, facebook_url text, youtube_url text,
  seo_title text, seo_description text,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- ===== customer data =====
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  house text, street text, area text, landmark text,
  city text not null, state text not null, pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, variant_id)
);
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create sequence public.order_number_seq start 1001;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('VPW-' || nextval('public.order_number_seq')::text),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  address jsonb not null,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  coupon_code text,
  shipping numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text not null default 'cod',
  payment_status text not null default 'pending',
  payment_ref text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  image_url text,
  price numeric(10,2) not null,
  quantity int not null,
  total numeric(10,2) not null
);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  image_url text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- grants
grant select on public.categories, public.subcategories, public.products, public.product_images,
  public.product_variants, public.variant_images, public.offers, public.offer_products,
  public.hero_banners, public.home_sections, public.site_settings, public.reviews to anon, authenticated;
grant insert, update, delete on public.categories, public.subcategories, public.products, public.product_images,
  public.product_variants, public.variant_images, public.offers, public.offer_products,
  public.hero_banners, public.home_sections, public.site_settings, public.coupons to authenticated;
grant select on public.coupons to authenticated;
grant select, insert, update, delete on public.addresses, public.cart_items, public.wishlist_items,
  public.orders, public.order_items, public.reviews to authenticated;
grant all on public.categories, public.subcategories, public.products, public.product_images,
  public.product_variants, public.variant_images, public.offers, public.offer_products,
  public.hero_banners, public.home_sections, public.site_settings, public.coupons,
  public.addresses, public.cart_items, public.wishlist_items, public.orders, public.order_items,
  public.reviews to service_role;
grant usage, select on sequence public.order_number_seq to authenticated, service_role;

-- rls
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.variant_images enable row level security;
alter table public.offers enable row level security;
alter table public.offer_products enable row level security;
alter table public.hero_banners enable row level security;
alter table public.home_sections enable row level security;
alter table public.coupons enable row level security;
alter table public.site_settings enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- public read + admin write for catalog/marketing
create policy "cat read" on public.categories for select using (true);
create policy "cat admin" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "sub read" on public.subcategories for select using (true);
create policy "sub admin" on public.subcategories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "prod read" on public.products for select using (is_published and not is_archived);
create policy "prod admin read" on public.products for select to authenticated using (public.is_admin());
create policy "prod admin" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "pimg read" on public.product_images for select using (true);
create policy "pimg admin" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "var read" on public.product_variants for select using (true);
create policy "var admin" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "vimg read" on public.variant_images for select using (true);
create policy "vimg admin" on public.variant_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "off read" on public.offers for select using (true);
create policy "off admin" on public.offers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "offp read" on public.offer_products for select using (true);
create policy "offp admin" on public.offer_products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "hero read" on public.hero_banners for select using (true);
create policy "hero admin" on public.hero_banners for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "hs read" on public.home_sections for select using (true);
create policy "hs admin" on public.home_sections for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "set read" on public.site_settings for select using (true);
create policy "set admin" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "coupon read" on public.coupons for select to authenticated using (true);
create policy "coupon admin" on public.coupons for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- customer-owned
create policy "addr own" on public.addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cart own" on public.cart_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wish own" on public.wishlist_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "order own read" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "order own insert" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "order admin update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "oi read" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "oi insert" on public.order_items for insert to authenticated with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "rev read" on public.reviews for select using (is_approved or user_id = auth.uid() or public.is_admin());
create policy "rev insert" on public.reviews for insert to authenticated with check (user_id = auth.uid() and exists (
  select 1 from public.order_items oi join public.orders o on o.id = oi.order_id
  where o.user_id = auth.uid() and oi.product_id = reviews.product_id));
create policy "rev own update" on public.reviews for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "rev delete" on public.reviews for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create trigger products_updated before update on public.products for each row execute function public.update_updated_at_column();
create trigger categories_updated before update on public.categories for each row execute function public.update_updated_at_column();
create trigger orders_updated before update on public.orders for each row execute function public.update_updated_at_column();

insert into public.site_settings (id) values (1);