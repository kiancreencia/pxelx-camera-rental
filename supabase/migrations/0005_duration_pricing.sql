-- Apply duration-based daily rates to selected cameras at checkout.

create or replace function public.rental_daily_rate(
  p_camera_slug text,
  p_base_rate numeric,
  p_days int
)
returns numeric
language sql
immutable
set search_path = public
as $$
  select case
    when p_camera_slug not in (
      'sony-a6400',
      'dji-osmo-nano',
      'insta360-x5',
      'dji-osmo-pocket-3',
      'insta360-ace-pro-2',
      'canon-s95',
      'canon-sx740-hs'
    ) then p_base_rate
    when p_days = 1 then p_base_rate + 50
    when p_days >= 5 then p_base_rate - case when p_camera_slug = 'canon-s95' then 20 else 50 end
    else p_base_rate
  end;
$$;

revoke all on function public.rental_daily_rate(text, numeric, int) from public, anon, authenticated;

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
  v_daily_rate numeric(10, 2);
  v_line numeric(10, 2);
  v_fulfillment text := p_customer ->> 'fulfillment';
  v_item_count int;
begin
  if coalesce(trim(p_customer ->> 'name'), '') = ''
     or coalesce(trim(p_customer ->> 'email'), '') = ''
     or coalesce(trim(p_customer ->> 'phone'), '') = '' then
    raise exception 'Name, email and phone are required.';
  end if;
  if v_fulfillment is null or v_fulfillment not in ('pickup', 'delivery') then
    raise exception 'Choose pickup or delivery.';
  end if;
  if v_fulfillment = 'delivery' and coalesce(trim(p_customer ->> 'address'), '') = '' then
    raise exception 'A delivery address is required for delivery.';
  end if;
  if coalesce(jsonb_typeof(p_items), '') <> 'array' then
    raise exception 'Your cart is empty.';
  end if;
  v_item_count := jsonb_array_length(p_items);
  if v_item_count = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if v_item_count > 20 then
    raise exception 'Too many items in one booking.';
  end if;

  loop
    v_reference := 'PX-' || substr(upper(replace(gen_random_uuid()::text, '-', '')), 1, 6);
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

    perform pg_advisory_xact_lock(hashtext(v_cam.id::text));

    if public.units_available(v_cam.id, v_start, v_end) < 1 then
      raise exception '% is not available for % to %.', v_cam.name, v_start, v_end;
    end if;

    v_days := v_end - v_start + 1;
    v_daily_rate := public.rental_daily_rate(v_cam.slug, v_cam.daily_rate, v_days);
    v_line := v_daily_rate * v_days;
    v_total := v_total + v_line;

    insert into public.booking_items (booking_id, camera_id, start_date, end_date, daily_rate, days, line_total)
    values (v_booking_id, v_cam.id, v_start, v_end, v_daily_rate, v_days, v_line);
  end loop;

  update public.bookings set total = v_total where id = v_booking_id;

  return json_build_object('reference', v_reference, 'total', v_total);
end;
$$;
