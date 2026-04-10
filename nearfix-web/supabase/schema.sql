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

alter table public.users enable row level security;
alter table public.workers enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

create policy "users can read own profile"
  on public.users
  for select
  using (auth.uid() is not null and auth.uid() = auth_user_id);

create policy "public can read worker identities"
  on public.users
  for select
  using (role = 'worker');

create policy "users can insert own profile"
  on public.users
  for insert
  with check (
    auth.uid() is not null
    and auth.uid() = auth_user_id
    and role in ('customer', 'worker')
  );

create policy "users can update own profile"
  on public.users
  for update
  using (auth.uid() is not null and auth.uid() = auth_user_id)
  with check (auth.uid() is not null and auth.uid() = auth_user_id);

create policy "workers are publicly readable"
  on public.workers
  for select
  using (true);

create policy "workers can update own profile"
  on public.workers
  for update
  using (
    exists (
      select 1
      from public.users u
      where u.id = public.workers.user_id
        and u.auth_user_id = auth.uid()
        and u.role = 'worker'
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.id = public.workers.user_id
        and u.auth_user_id = auth.uid()
        and u.role = 'worker'
    )
  );

create policy "workers slots are publicly readable"
  on public.availability_slots
  for select
  using (true);

create policy "workers can manage own slots"
  on public.availability_slots
  for all
  using (
    exists (
      select 1
      from public.workers w
      join public.users u on u.id = w.user_id
      where w.id = public.availability_slots.worker_id
        and u.auth_user_id = auth.uid()
        and u.role = 'worker'
    )
  )
  with check (
    exists (
      select 1
      from public.workers w
      join public.users u on u.id = w.user_id
      where w.id = public.availability_slots.worker_id
        and u.auth_user_id = auth.uid()
        and u.role = 'worker'
    )
  );

create policy "customers can update slots linked to own booking"
  on public.availability_slots
  for update
  using (
    exists (
      select 1
      from public.bookings b
      join public.users u on u.id = b.customer_id
      where b.slot_id = public.availability_slots.id
        and u.auth_user_id = auth.uid()
        and u.role = 'customer'
    )
  )
  with check (
    exists (
      select 1
      from public.bookings b
      join public.users u on u.id = b.customer_id
      where b.slot_id = public.availability_slots.id
        and u.auth_user_id = auth.uid()
        and u.role = 'customer'
    )
  );

create policy "customers can read own bookings"
  on public.bookings
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = public.bookings.customer_id
        and u.auth_user_id = auth.uid()
    )
  );

create policy "workers can read assigned bookings"
  on public.bookings
  for select
  using (
    exists (
      select 1
      from public.workers w
      join public.users u on u.id = w.user_id
      where w.id = public.bookings.worker_id
        and u.auth_user_id = auth.uid()
        and u.role = 'worker'
    )
  );

create policy "workers can update assigned bookings"
  on public.bookings
  for update
  using (
    exists (
      select 1
      from public.workers w
      join public.users u on u.id = w.user_id
      where w.id = public.bookings.worker_id
        and u.auth_user_id = auth.uid()
        and u.role = 'worker'
    )
  )
  with check (
    exists (
      select 1
      from public.workers w
      join public.users u on u.id = w.user_id
      where w.id = public.bookings.worker_id
        and u.auth_user_id = auth.uid()
        and u.role = 'worker'
    )
  );

create policy "customers can create bookings"
  on public.bookings
  for insert
  with check (
    exists (
      select 1
      from public.users u
      where u.id = public.bookings.customer_id
        and u.auth_user_id = auth.uid()
        and u.role = 'customer'
    )
  );

create policy "customers can update own pending bookings"
  on public.bookings
  for update
  using (
    exists (
      select 1
      from public.users u
      where u.id = public.bookings.customer_id
        and u.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.id = public.bookings.customer_id
        and u.auth_user_id = auth.uid()
    )
  );

create policy "customers can read reviews for their bookings"
  on public.reviews
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = public.reviews.customer_id
        and u.auth_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.workers w
      join public.users u on u.id = w.user_id
      where w.id = public.reviews.worker_id
        and u.auth_user_id = auth.uid()
    )
  );

create policy "customers can create reviews for completed bookings"
  on public.reviews
  for insert
  with check (
    exists (
      select 1
      from public.bookings b
      join public.users u on u.id = b.customer_id
      where b.id = public.reviews.booking_id
        and b.status = 'COMPLETED'
        and u.auth_user_id = auth.uid()
    )
  );

create policy "admin can read all users"
  on public.users
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role = 'admin'
    )
  );

create policy "admin can manage users"
  on public.users
  for update
  using (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role = 'admin'
    )
  );

create policy "admin can read all bookings"
  on public.bookings
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role = 'admin'
    )
  );

create policy "admin can manage worker verification"
  on public.workers
  for update
  using (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role = 'admin'
    )
  );

create policy "admin can manage reviews"
  on public.reviews
  for all
  using (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.users u
      where u.auth_user_id = auth.uid()
        and u.role = 'admin'
    )
  );
