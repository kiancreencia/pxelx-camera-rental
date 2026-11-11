-- pxelx camera rental: schema, availability logic, and row level security.
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0
);

create table public.cameras (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  slug text not null unique,
  name text not null,
  brand text not null,
  tagline text not null default '',
  description text not null default '',
  daily_rate numeric(10, 2) not null check (daily_rate >= 0),
  deposit numeric(10, 2) not null default 0 check (deposit >= 0),
  quantity int not null default 1 check (quantity >= 0), -- units you own
  includes text[] not null default '{}',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create type public.booking_status as enum (
  'pending',    -- submitted, waiting for you to review and confirm
  'confirmed',  -- approved / reservation fee paid
  'picked_up',  -- gear is out with the customer
  'returned',   -- gear is back
  'cancelled'
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  email text not null,
  phone text not null,
  fulfillment text not null check (fulfillment in ('pickup', 'delivery')),
  delivery_address text,
  notes text,
  status public.booking_status not null default 'pending',
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  camera_id uuid not null references public.cameras (id),
  start_date date not null,
  end_date date not null,
  daily_rate numeric(10, 2) not null,
  days int not null,
  line_total numeric(10, 2) not null,
  check (end_date >= start_date)
);

create index booking_items_camera_dates on public.booking_items (camera_id, start_date, end_date);
create index booking_items_booking on public.booking_items (booking_id);
create index bookings_status_created on public.bookings (status, created_at desc);

-- Admins are users listed here. Add yourself after signing up:
--   insert into public.profiles (id, is_admin) values ('<your auth.users id>', true);
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false
);

-- ------------------------------------------------------------ helpers

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Units of a camera free on EVERY day between p_start and p_end (inclusive).
-- Pending bookings hold stock, so two people can't reserve the same unit.
create or replace function public.units_available(p_camera uuid, p_start date, p_end date)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(min(cam.quantity - coalesce(u.used, 0)), 0)::int
  from public.cameras cam
  cross join generate_series(p_start, p_end, interval '1 day') as d
  left join lateral (
    select count(*) as used
    from public.booking_items bi
    join public.bookings b on b.id = bi.booking_id
    where bi.camera_id = cam.id
      and b.status in ('pending', 'confirmed', 'picked_up')
      and d::date between bi.start_date and bi.end_date
  ) u on true
  where cam.id = p_camera and cam.is_active;
$$;

-- --------------------------------------------------------- create_booking
-- Called from the website with the anon key. Prices come from the cameras
-- table, never from the client. Availability is re-checked under a lock.
--
-- p_customer: { name, email, phone, fulfillment, address?, notes? }
-- p_items:    [ { camera_id, start_date, end_date } ]
-- returns:    { reference, total }

create or replace function public.create_booking(p_customer jsonb, p_items jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Asia/Manila')::date;
  v_booking_id uuid;
  v_reference text;
  v_total numeric(10, 2) := 0;
  v_item jsonb;
  v_cam public.cameras;
  v_start date;
  v_end date;
  v_days int;
  v_line numeric(10, 2);
  v_fulfillment text := p_customer ->> 'fulfillment';
begin
  if coalesce(trim(p_customer ->> 'name'), '') = ''
     or coalesce(trim(p_customer ->> 'email'), '') = ''
     or coalesce(trim(p_customer ->> 'phone'), '') = '' then
    raise exception 'Name, email and phone are required.';
  end if;
  if v_fulfillment not in ('pickup', 'delivery') then
    raise exception 'Choose pickup or delivery.';
  end if;
  if v_fulfillment = 'delivery' and coalesce(trim(p_customer ->> 'address'), '') = '' then
    raise exception 'A delivery address is required for delivery.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if jsonb_array_length(p_items) > 20 then
    raise exception 'Too many items in one booking.';
  end if;

  -- Unique, human-friendly reference like PX-7K2M9Q
  loop
    v_reference := 'PX-' || substr(translate(upper(encode(gen_random_bytes(12), 'base64')), '+/=OIL01', 'XYZ'), 1, 6);
    exit when not exists (select 1 from public.bookings where reference = v_reference);
  end loop;

  insert into public.bookings (reference, customer_name, email, phone, fulfillment, delivery_address, notes)
  values (
    v_reference,
    trim(p_customer ->> 'name'),
    lower(trim(p_customer ->> 'email')),
    trim(p_customer ->> 'phone'),
    v_fulfillment,
    nullif(trim(p_customer ->> 'address'), ''),
    nullif(trim(p_customer ->> 'notes'), '')
  )
  returning id into v_booking_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_start := (v_item ->> 'start_date')::date;
    v_end := (v_item ->> 'end_date')::date;

    if v_start is null or v_end is null or v_end < v_start then
      raise exception 'Invalid rental dates.';
    end if;
    if v_start < v_today then
      raise exception 'Rental dates can''t be in the past.';
    end if;
    if v_end - v_start + 1 > 30 then
      raise exception 'Rentals are limited to 30 days. Message us for longer rentals.';
    end if;

    select * into v_cam
    from public.cameras
    where id = (v_item ->> 'camera_id')::uuid and is_active;
    if not found then
      raise exception 'One of the items is no longer available.';
    end if;

    -- Serialise bookings per camera so two checkouts can't take the last unit.
    perform pg_advisory_xact_lock(hashtext(v_cam.id::text));

    if public.units_available(v_cam.id, v_start, v_end) < 1 then
      raise exception '% is not available for % to %.', v_cam.name, v_start, v_end;
    end if;

    v_days := v_end - v_start + 1;
    v_line := v_cam.daily_rate * v_days;
    v_total := v_total + v_line;

    insert into public.booking_items (booking_id, camera_id, start_date, end_date, daily_rate, days, line_total)
    values (v_booking_id, v_cam.id, v_start, v_end, v_cam.daily_rate, v_days, v_line);
  end loop;

  update public.bookings set total = v_total where id = v_booking_id;

  return json_build_object('reference', v_reference, 'total', v_total);
end;
$$;

-- --------------------------------------------------------- get_booking
-- Lets a customer look up their own booking with reference + email.

create or replace function public.get_booking(p_reference text, p_email text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'reference', b.reference,
    'status', b.status,
    'customer_name', b.customer_name,
    'email', b.email,
    'phone', b.phone,
    'fulfillment', b.fulfillment,
    'delivery_address', b.delivery_address,
    'notes', b.notes,
    'total', b.total,
    'created_at', b.created_at,
    'items', coalesce((
      select json_agg(json_build_object(
        'camera_name', c.name,
        'start_date', i.start_date,
        'end_date', i.end_date,
        'days', i.days,
        'daily_rate', i.daily_rate,
        'line_total', i.line_total
      ) order by i.start_date)
      from public.booking_items i
      join public.cameras c on c.id = i.camera_id
      where i.booking_id = b.id
    ), '[]'::json)
  )
  from public.bookings b
  where b.reference = upper(trim(p_reference))
    and b.email = lower(trim(p_email));
$$;

grant execute on function public.units_available(uuid, date, date) to anon, authenticated;
grant execute on function public.create_booking(jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_booking(text, text) to anon, authenticated;

-- ------------------------------------------------ row level security

alter table public.categories enable row level security;
alter table public.cameras enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.profiles enable row level security;

-- Public catalog
create policy "categories are public" on public.categories for select using (true);
create policy "active cameras are public" on public.cameras for select using (is_active);

-- Admin: full access to everything
create policy "admin manages categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manages cameras" on public.cameras for all using (public.is_admin()) with check (public.is_admin());
create policy "admin reads bookings" on public.bookings for select using (public.is_admin());
create policy "admin updates bookings" on public.bookings for update using (public.is_admin()) with check (public.is_admin());
create policy "admin reads booking items" on public.booking_items for select using (public.is_admin());

-- A signed-in user can see their own profile row (so the app can check is_admin)
create policy "read own profile" on public.profiles for select using (id = auth.uid());

-- No policies on bookings/booking_items for anon: customers only touch them
-- through create_booking() and get_booking() above.
