-- Return availability for every day in a calendar month.

create or replace function public.camera_calendar_availability(
  p_camera uuid,
  p_start date,
  p_end date
)
returns table(rental_date date, available int)
language sql
stable
security definer
set search_path = public
as $$
  select d::date, public.units_available(p_camera, d::date, d::date)
  from generate_series(p_start, p_end, interval '1 day') as d;
$$;

grant execute on function public.camera_calendar_availability(uuid, date, date) to anon, authenticated;
