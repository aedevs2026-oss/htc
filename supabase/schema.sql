-- HTC Furniture production schema for Supabase/PostgreSQL
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','admin','editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  slug text primary key,
  name text not null,
  parent_slug text references public.categories(slug) on delete set null,
  description text not null default '',
  image_path text,
  product_count integer not null default 0,
  source_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  wp_id integer unique,
  name text not null,
  display_name text,
  slug text unique,
  sku text,
  price numeric(12,2),
  regular_price numeric(12,2),
  sale_price numeric(12,2),
  currency text not null default 'INR',
  primary_category text,
  categories text[] not null default '{}',
  category_slugs text[] not null default '{}',
  description text not null default '',
  short_description text not null default '',
  brand text not null default 'HTC',
  image_path text,
  images jsonb not null default '[]'::jsonb,
  stock_status text not null default 'in_stock',
  source_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_name_idx on public.products(name);
create index if not exists products_published_idx on public.products(is_published);
create index if not exists products_category_slugs_idx on public.products using gin(category_slugs);
create index if not exists audit_created_idx on public.admin_audit_log(created_at desc);

create or replace function public.is_htc_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid() and is_active=true); $$;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_audit_log enable row level security;

drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Public read published products" on public.products;
drop policy if exists "Admins manage categories" on public.categories;
drop policy if exists "Admins manage products" on public.products;
drop policy if exists "Admins read all products" on public.products;

create policy "Public read categories" on public.categories for select to anon,authenticated using(true);
create policy "Public read published products" on public.products for select to anon,authenticated using(is_published=true);
create policy "Admin read all products" on public.products for select to authenticated using(public.is_htc_admin());
create policy "Admin manage products" on public.products for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());
create policy "Admin manage categories" on public.categories for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());
create policy "Admin manage settings" on public.site_settings for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());
create policy "Admin read audit" on public.admin_audit_log for select to authenticated using(public.is_htc_admin());
create policy "Admin insert audit" on public.admin_audit_log for insert to authenticated with check(public.is_htc_admin());
create policy "Admins read own role" on public.admin_users for select to authenticated using(user_id=auth.uid());

-- Provision the first admin manually after creating the Auth user:
-- insert into public.admin_users(user_id,role) values ('AUTH-USER-UUID','owner');
-- Never expose service_role key in NEXT_PUBLIC_* variables.
