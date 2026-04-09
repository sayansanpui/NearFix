begin;

create or replace function public.seed_uuid(seed bigint)
returns uuid
language sql
immutable
as $$
  select ('00000000-0000-0000-0000-' || lpad(to_hex(seed), 12, '0'))::uuid
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null unique,
  created_at timestamptz not null default now()
);

delete from public.reviews;
delete from public.bookings;
delete from public.availability_slots;
delete from public.workers;
delete from public.users;
delete from public.categories;

insert into public.categories (name, sort_order)
values
  ('Electrician', 1),
  ('Plumber', 2),
  ('Carpenter', 3),
  ('AC Repair', 4),
  ('RO Repair', 5),
  ('Home Cleaning', 6),
  ('Painter', 7),
  ('Appliance Repair', 8);

with customer_seed (rn, name, email) as (
  values
    (1, 'Aarav Sharma', 'aarav.sharma@example.com'),
    (2, 'Ananya Iyer', 'ananya.iyer@example.com'),
    (3, 'Rohit Verma', 'rohit.verma@example.com'),
    (4, 'Priya Nair', 'priya.nair@example.com'),
    (5, 'Kabir Khan', 'kabir.khan@example.com'),
    (6, 'Sneha Patil', 'sneha.patil@example.com'),
    (7, 'Rahul Das', 'rahul.das@example.com'),
    (8, 'Ishita Gupta', 'ishita.gupta@example.com'),
    (9, 'Vikram Singh', 'vikram.singh@example.com'),
    (10, 'Meera Menon', 'meera.menon@example.com'),
    (11, 'Arjun Reddy', 'arjun.reddy@example.com'),
    (12, 'Nisha Bhandari', 'nisha.bhandari@example.com'),
    (13, 'Siddharth Jain', 'siddharth.jain@example.com'),
    (14, 'Pooja Kulkarni', 'pooja.kulkarni@example.com'),
    (15, 'Aditya Bose', 'aditya.bose@example.com')
),
inserted_customers as (
  insert into public.users (id, name, email, role)
  select public.seed_uuid(1000 + rn), name, email, 'customer'
  from customer_seed
  returning id, name, email
),
worker_seed (rn, name, email, category, experience, bio, starting_price, service_area, verified) as (
  values
    (1, 'Suresh Kumar', 'suresh.kumar@example.com', 'Electrician', 9, 'Trusted residential electrician specializing in wiring, switchboard fixes, and safety inspections.', 499, 'Andheri West, Mumbai', true),
    (2, 'Imran Ali', 'imran.ali@example.com', 'Plumber', 7, 'Quick-response plumber for leak repairs, tap fittings, and bathroom installations.', 399, 'Indiranagar, Bengaluru', true),
    (3, 'Manoj Tiwari', 'manoj.tiwari@example.com', 'Carpenter', 12, 'Experienced carpenter for modular furniture repair, door alignment, and custom woodwork.', 650, 'Salt Lake, Kolkata', true),
    (4, 'Farhan Shaikh', 'farhan.shaikh@example.com', 'AC Repair', 8, 'AC technician for cooling issues, gas refill checks, and annual servicing.', 799, 'Baner, Pune', true),
    (5, 'Deepak Yadav', 'deepak.yadav@example.com', 'RO Repair', 6, 'Water purifier service expert handling filter changes and pump replacements.', 449, 'Gachibowli, Hyderabad', false),
    (6, 'Rakesh Mehta', 'rakesh.mehta@example.com', 'Home Cleaning', 5, 'Deep-clean specialist for apartments, kitchens, and post-renovation cleanup.', 999, 'Sector 62, Noida', true),
    (7, 'Mohan Rao', 'mohan.rao@example.com', 'Painter', 11, 'Painter for interior walls, touch-ups, waterproof coatings, and finish matching.', 550, 'Kothrud, Pune', true),
    (8, 'Salman Qureshi', 'salman.qureshi@example.com', 'Appliance Repair', 10, 'Repairs washing machines, microwaves, and refrigerators with doorstep diagnosis.', 699, 'Jayanagar, Bengaluru', true),
    (9, 'Arvind Joshi', 'arvind.joshi@example.com', 'Electrician', 13, 'Commercial and home electrical repair with neat wiring and fast diagnosis.', 599, 'Thane West, Mumbai', true),
    (10, 'Ravi Shankar', 'ravi.shankar@example.com', 'Plumber', 9, 'Handles geyser installation, pipeline blockages, and bathroom fitting jobs.', 429, 'Whitefield, Bengaluru', false),
    (11, 'Naveen Kumar', 'naveen.kumar@example.com', 'Carpenter', 8, 'Skilled in kitchen cabinets, shelf fitting, and wooden door restoration.', 720, 'Anna Nagar, Chennai', true),
    (12, 'Faiz Ahmed', 'faiz.ahmed@example.com', 'AC Repair', 7, 'Split AC repair, condenser cleaning, and quick cooling checks.', 859, 'Madhapur, Hyderabad', true),
    (13, 'Gaurav Mishra', 'gaurav.mishra@example.com', 'RO Repair', 5, 'Affordable RO maintenance with filter swap and leakage fixes.', 399, 'Rajouri Garden, Delhi', true),
    (14, 'Kiran Deshmukh', 'kiran.deshmukh@example.com', 'Home Cleaning', 6, 'Full-home cleaning and sanitization with careful kitchen and bathroom detailing.', 1099, 'Kalyani Nagar, Pune', true),
    (15, 'Ramesh Iqbal', 'ramesh.iqbal@example.com', 'Painter', 14, 'Interior and exterior painting expert with consistent finish quality.', 620, 'Bandra East, Mumbai', true),
    (16, 'Bharat Chawla', 'bharat.chawla@example.com', 'Appliance Repair', 9, 'Fast appliance troubleshooting for fridge noise, drum issues, and micro oven faults.', 749, 'Kakkanad, Kochi', true),
    (17, 'Muthu Krishnan', 'muthu.krishnan@example.com', 'Electrician', 10, 'Safety-first electrician for power outages, inverter setup, and fan installation.', 520, 'T Nagar, Chennai', true),
    (18, 'Nadeem Pathan', 'nadeem.pathan@example.com', 'Plumber', 11, 'Plumbing repair with transparent pricing and clean worksite habits.', 470, 'Bopal, Ahmedabad', true),
    (19, 'Prakash Saini', 'prakash.saini@example.com', 'Carpenter', 7, 'Handles furniture assembly, cabinet repairs, and wooden partition work.', 575, 'Lajpat Nagar, Delhi', true),
    (20, 'Sanjay Patil', 'sanjay.patil@example.com', 'AC Repair', 12, 'Seasonal AC servicing, compressor checks, and gas leak detection.', 899, 'Viman Nagar, Pune', true)
),
inserted_worker_users as (
  insert into public.users (id, name, email, role)
  select public.seed_uuid(2000 + rn), name, email, 'worker'
  from worker_seed
  returning id, name, email
),
inserted_workers as (
  insert into public.workers (
    id,
    user_id,
    category,
    experience,
    bio,
    starting_price,
    service_area,
    verified,
    rating,
    jobs_completed
  )
  select
    u.id,
    u.id,
    w.category,
    w.experience,
    w.bio,
    w.starting_price,
    w.service_area,
    w.verified,
    0,
    0
  from worker_seed w
  join inserted_worker_users u on u.email = w.email
  returning id, user_id, category, starting_price
)
select 1;

insert into public.users (id, name, email, role)
values (public.seed_uuid(9000), 'NearFix Admin', 'admin@nearfix.example.com', 'admin');

with slot_source as (
  select
    w.id as worker_id,
    w.category,
    gs.slot_num,
    current_date + gs.slot_num as slot_date,
    case gs.slot_num
      when 1 then '09:00'
      when 2 then '11:30'
      when 3 then '14:30'
      else '17:00'
    end as start_time,
    case gs.slot_num
      when 1 then '10:30'
      when 2 then '13:00'
      when 3 then '16:00'
      else '18:30'
    end as end_time
  from public.workers w
  cross join generate_series(1, 4) as gs(slot_num)
),
numbered_slots as (
  select
    row_number() over (order by slot_num, worker_id) as rn,
    worker_id,
    slot_date,
    start_time,
    end_time
  from slot_source
),
inserted_slots as (
  insert into public.availability_slots (id, worker_id, date, start_time, end_time, is_booked)
  select public.seed_uuid(3000 + rn), worker_id, slot_date, start_time, end_time, false
  from numbered_slots
  returning id, worker_id, date, start_time, end_time
),
numbered_booking_slots as (
  select
    row_number() over (order by s.date, s.start_time, s.worker_id) as rn,
    s.id as slot_id,
    s.worker_id,
    w.starting_price
  from inserted_slots s
  join public.workers w on w.id = s.worker_id
),
booking_rows as (
  select
    rn,
    slot_id,
    worker_id,
    starting_price,
    case (rn - 1) % 6
      when 0 then 'AC is not cooling properly.'
      when 1 then 'Kitchen sink is leaking.'
      when 2 then 'Need a wooden cabinet hinge repaired.'
      when 3 then 'Routine full-home cleaning required.'
      when 4 then 'Painter needed for bedroom touch-up.'
      else 'Water purifier is making noise.'
    end as description,
    case
      when rn <= 52 then 'COMPLETED'
      when rn between 53 and 56 then 'CONFIRMED'
      when rn between 57 and 58 then 'PENDING'
      when rn = 59 then 'REJECTED'
      else 'CANCELLED'
    end as status,
    round((starting_price + ((rn - 1) % 4) * 150)::numeric, 2) as price,
    ((rn - 1) % 15) + 1 as customer_rn
  from numbered_booking_slots
  where rn <= 60
),
inserted_bookings as (
  insert into public.bookings (id, customer_id, worker_id, slot_id, description, status, price)
  select
    public.seed_uuid(5000 + rn),
    u.id,
    worker_id,
    slot_id,
    description,
    status,
    price
  from booking_rows br
  join public.users u on u.role = 'customer' and u.id = public.seed_uuid(1000 + br.customer_rn)
  returning id, worker_id, customer_id, slot_id, status
)
update public.availability_slots s
set is_booked = true,
    updated_at = now()
where s.id in (select slot_id from booking_rows);

with completed_bookings as (
  select
    row_number() over (order by b.created_at, b.id) as rn,
    b.id as booking_id,
    b.worker_id,
    b.customer_id
  from public.bookings b
  where b.status = 'COMPLETED'
),
review_rows as (
  select
    rn,
    booking_id,
    worker_id,
    customer_id,
    case rn % 5
      when 0 then 5
      when 1 then 4
      when 2 then 5
      when 3 then 4
      else 5
    end as rating,
    case rn % 4
      when 0 then 'Polite, punctual, and left the place clean.'
      when 1 then 'Quick diagnosis and transparent pricing.'
      when 2 then 'Professional work with good communication.'
      else 'Finished the job neatly and on time.'
    end as review,
    case rn % 5
      when 0 then 5
      when 1 then 4
      when 2 then 5
      when 3 then 4
      else 5
    end as punctuality,
    case rn % 5
      when 0 then 5
      when 1 then 4
      when 2 then 5
      when 3 then 4
      else 5
    end as work_quality,
    case rn % 4
      when 0 then 5
      when 1 then 4
      when 2 then 5
      else 5
    end as behavior
  from completed_bookings
)
insert into public.reviews (
  id,
  booking_id,
  worker_id,
  customer_id,
  rating,
  review,
  punctuality,
  work_quality,
  behavior
)
select
  public.seed_uuid(7000 + rn),
  booking_id,
  worker_id,
  customer_id,
  rating,
  review,
  punctuality,
  work_quality,
  behavior
from review_rows;

update public.workers w
set
  jobs_completed = stats.jobs_completed,
  rating = stats.average_rating,
  updated_at = now()
from (
  select
    b.worker_id,
    count(*)::integer as jobs_completed,
    round(avg(r.rating)::numeric, 2) as average_rating
  from public.bookings b
  join public.reviews r on r.booking_id = b.id
  where b.status = 'COMPLETED'
  group by b.worker_id
) stats
where stats.worker_id = w.id;

commit;
