# pxelx camera rental

A camera rental booking site. Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase.

Customers create an account, sign in, pick dates, see which cameras are free, add gear to a cart, and send a booking.
You review bookings in a staff page and move them through confirmed, picked up and returned.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Supabase keys the site runs in **demo mode** with sample
cameras so you can look around. Booking and staff sign-in are off until you connect Supabase.

## Connect Supabase

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_customer_auth.sql`, then
   `supabase/migrations/0003_calendar_availability.sql`, then
   `supabase/migrations/0005_duration_pricing.sql`, then `supabase/seed.sql`
   (sample cameras; replace them with your real inventory).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon (publishable) key
   from Project settings > API.
4. Restart `npm run dev`.

If Supabase was already set up before the calendar update, also run
`supabase/migrations/0003_calendar_availability.sql` in the SQL editor.
If it was already set up before this booking reference fix, run
`supabase/migrations/0004_booking_reference.sql` in the SQL editor after `0002_customer_auth.sql`.
Fresh installs can skip `0004_booking_reference.sql`; its corrected booking function is already in
`0001_init.sql`.
If you already applied an earlier version of `0004_booking_reference.sql`, run the updated file
again to apply the input-validation fixes.
Run `supabase/migrations/0005_duration_pricing.sql` on existing projects after the customer-auth
migration to apply the selected cameras' duration-based rates. Rerun it to update existing projects
when the duration pricing changes.

### Create your staff login

1. In Supabase: Authentication > Users > Add user (email and password).
2. Copy that user's id, then run this whole batch in the Supabase SQL editor. `reset role` restores
   the session role if the editor is currently executing as `anon` or `authenticated`. Do not run
   this through the app's Supabase client: row-level security intentionally prevents users from
   granting themselves admin access.

   ```sql
   reset role;

   insert into public.profiles (id, is_admin)
   values ('PASTE-USER-ID', true)
   on conflict (id) do update set is_admin = true;
   ```

3. Sign in at `/admin` (there's a "Staff sign in" link in the footer).

Customers can create an account from the navigation sign-in page. If email confirmation is
enabled in Supabase, set the project's Site URL and redirect allowlist to include
`http://localhost:3000/auth/callback` and your deployed site's `/auth/callback` URL.
To enable Google sign-in, enable the Google provider under Supabase Authentication > Sign In /
Providers and configure its client ID and secret. Add Supabase's OAuth callback URL
(`https://<project-ref>.supabase.co/auth/v1/callback`) to the Google OAuth client, and allow the
app's `/auth/callback` URLs in Supabase's redirect URL settings.

## How booking works

- **Availability** is calculated in the database (`units_available`). A camera with
  `quantity = 2` can be booked by two customers on the same dates. Pending, confirmed and
  picked-up bookings hold stock; returned and cancelled ones free it.
- **Prices** are set by the database when a booking is created (`create_booking`), never by the
  browser, so customers can't change a rate.
- **Double-booking** is prevented: `create_booking` locks per camera and re-checks availability.
- **Customers** must be signed in to send a booking. Their booking email is taken from their
  authenticated account; they can look up a booking with its reference code (like `PX-7K2M9Q`)
  and email.
- **Row level security**: the public can only read active cameras. Bookings are only reachable
  through the two database functions, and admins through their login.

A rental day is a calendar day, counting both pick-up and return day. Rentals are capped at
30 days online (`maxRentalDays` in `src/lib/config.ts`).

## Make it yours

| What | Where |
| --- | --- |
| Contact links, pickup address, payment methods, rental hours note | `src/lib/config.ts` |
| FAQ and "how it works" copy | `src/app/page.tsx` |
| Colors and fonts | `src/app/globals.css` |
| Cameras, rates, quantity, deposit | the `cameras` table in Supabase |
| Camera photos | set `image_url` on a camera. Without one, the card shows pixel-art lens art |

## Not included yet

- Online payment. For now you confirm the booking and message the customer the payment steps.
- ID verification and a signed rental agreement.
- Email or SMS notifications.
- Photo uploads (paste image URLs, or use Supabase Storage).
- Rate limiting on the booking function. Add it before a big launch.
- Staff session refresh: the staff login lasts about an hour, then asks you to sign in again.

## Notes

- `cacheComponents` is off in `next.config.ts` because every page here depends on today's date
  or live availability.
- Deploy to Vercel and add the two env vars from `.env.example`.
