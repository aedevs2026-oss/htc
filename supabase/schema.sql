-- Run in Supabase SQL editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  slug text primary key,
  name text not null,
  parent_slug text references public.categories (slug) on delete set null,
  description text default '',
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
  slug text,
  sku text,
  price numeric(12, 2),
  regular_price numeric(12, 2),
  sale_price numeric(12, 2),
  currency text not null default 'INR',
  primary_category text,
  categories text[] not null default '{}',
  category_slugs text[] not null default '{}',
  description text default '',
  short_description text default '',
  brand text default 'HTC',
  image_path text,
  images jsonb not null default '[]'::jsonb,
  stock_status text not null default 'in_stock',
  source_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_name_idx on public.products (name);
create index if not exists products_published_idx on public.products (is_published);
create index if not exists products_category_slugs_idx on public.products using gin (category_slugs);

alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "Public read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Public read published products"
  on public.products for select
  to anon, authenticated
  using (is_published = true);

create policy "Admins manage categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins manage products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins read all products"
  on public.products for select
  to authenticated
  using (true);
