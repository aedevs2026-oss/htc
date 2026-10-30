-- HTC enquiries, dealer network and catalogue relationships
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  interest text not null default 'General enquiry',
  message text not null,
  product text,
  sku text,
  company text,
  status text not null default 'new' check (status in ('new','in_progress','contacted','closed','spam')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);
create index if not exists enquiries_status_idx on public.enquiries(status);

create table if not exists public.dealers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  city text not null,
  state text not null default 'Tamil Nadu',
  pincode text,
  address text,
  phone text,
  email text,
  website text,
  latitude double precision,
  longitude double precision,
  description text,
  is_authorised boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dealers_city_idx on public.dealers(city);
create index if not exists dealers_active_idx on public.dealers(is_active);

create table if not exists public.brands (
  slug text primary key,
  name text not null,
  logo_path text,
  description text not null default '',
  website text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.rooms (
  slug text primary key,
  name text not null,
  description text not null default '',
  image_path text,
  sort_order integer not null default 0
);
create table if not exists public.product_rooms (
  product_wp_id integer not null references public.products(wp_id) on delete cascade,
  room_slug text not null references public.rooms(slug) on delete cascade,
  primary key(product_wp_id, room_slug)
);
create table if not exists public.product_brands (
  product_wp_id integer not null references public.products(wp_id) on delete cascade,
  brand_slug text not null references public.brands(slug) on delete cascade,
  primary key(product_wp_id, brand_slug)
);

alter table public.enquiries enable row level security;
alter table public.dealers enable row level security;
alter table public.brands enable row level security;
alter table public.rooms enable row level security;
alter table public.product_rooms enable row level security;
alter table public.product_brands enable row level security;

drop policy if exists "Public insert website enquiries" on public.enquiries;
create policy "Public insert website enquiries" on public.enquiries for insert to anon,authenticated with check (char_length(name) between 1 and 120 and char_length(email) between 3 and 180 and char_length(message) between 1 and 3000);
drop policy if exists "Admins manage enquiries" on public.enquiries;
create policy "Admins manage enquiries" on public.enquiries for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());
drop policy if exists "Public read active dealers" on public.dealers;
create policy "Public read active dealers" on public.dealers for select to anon,authenticated using(is_active=true);
drop policy if exists "Admins manage dealers" on public.dealers;
create policy "Admins manage dealers" on public.dealers for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());
drop policy if exists "Public read brands" on public.brands;
create policy "Public read brands" on public.brands for select to anon,authenticated using(true);
drop policy if exists "Public read rooms" on public.rooms;
create policy "Public read rooms" on public.rooms for select to anon,authenticated using(true);
drop policy if exists "Public read product rooms" on public.product_rooms;
create policy "Public read product rooms" on public.product_rooms for select to anon,authenticated using(true);
drop policy if exists "Public read product brands" on public.product_brands;
create policy "Public read product brands" on public.product_brands for select to anon,authenticated using(true);
drop policy if exists "Admins manage brands" on public.brands;
create policy "Admins manage brands" on public.brands for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());
drop policy if exists "Admins manage rooms" on public.rooms;
create policy "Admins manage rooms" on public.rooms for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());
drop policy if exists "Admins manage product rooms" on public.product_rooms;
create policy "Admins manage product rooms" on public.product_rooms for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());
drop policy if exists "Admins manage product brands" on public.product_brands;
create policy "Admins manage product brands" on public.product_brands for all to authenticated using(public.is_htc_admin()) with check(public.is_htc_admin());

insert into public.rooms(slug,name,description,image_path,sort_order) values
('living-room','Living Room','Sofas, lounge chairs, coffee tables and living storage.','/images/living-room-hero.webp',1),
('bedroom','Bedroom','Beds, wardrobes, bedside tables and bedroom storage.','/images/bedroom.webp',2),
('dining-room','Dining Room','Dining tables, chairs, cabinets and bar furniture.','/images/dining-room.webp',3),
('home-office','Home Office','Desks, task chairs and work storage.','/images/home-office.webp',4),
('outdoor-living','Outdoor Living','Outdoor seating and relaxed living pieces.','/images/outdoor-living.webp',5),
('reading-corner','Reading Corner','Accent chairs, side tables and occasional furniture.','/images/accent-chair.webp',6)
on conflict(slug) do update set name=excluded.name,description=excluded.description,image_path=excluded.image_path,sort_order=excluded.sort_order;

