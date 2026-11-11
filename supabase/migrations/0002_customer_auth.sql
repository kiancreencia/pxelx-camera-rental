-- Require an authenticated customer account before creating a booking.
-- Apply after 0001_init.sql.

create or replace function public.create_customer_booking(p_customer jsonb, p_items jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  v_customer_email text := lower(trim(coalesce(p_customer ->> 'email', '')));
begin
  if auth.uid() is null or v_auth_email = '' then
    raise exception 'Sign in with an email address before booking.';
  end if;
  if v_customer_email <> v_auth_email then
    raise exception 'The booking email must match your signed-in account.';
  end if;

  return public.create_booking(p_customer, p_items);
end;
$$;

revoke all on function public.create_booking(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.create_customer_booking(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_customer_booking(jsonb, jsonb) to authenticated;
