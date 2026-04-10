create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text not null,
  email text not null unique,
  role text not null check (role in ('customer', 'worker', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  category text not null,
  experience integer not null default 0,
  bio text not null default '',
  starting_price numeric(10,2) not null default 0,
  service_area text not null default '',
  verified boolean not null default false,
  rating numeric(3,2) not null default 0,
  jobs_completed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  date date not null,
  start_time text not null,
  end_time text not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (worker_id, date, start_time, end_time)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  slot_id uuid not null unique references public.availability_slots(id) on delete cascade,
  description text not null default '',
  status text not null check (status in ('PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED')),
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text not null default '',
  punctuality integer not null check (punctuality between 1 and 5),
  work_quality integer not null check (work_quality between 1 and 5),
  behavior integer not null check (behavior between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists workers_category_idx on public.workers (category);
create index if not exists workers_verified_idx on public.workers (verified);
create index if not exists slots_worker_date_idx on public.availability_slots (worker_id, date);
create index if not exists bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index if not exists bookings_worker_idx on public.bookings (worker_id, created_at desc);
create index if not exists reviews_worker_idx on public.reviews (worker_id, created_at desc);
