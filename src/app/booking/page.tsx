import type { Metadata } from "next";
import { getBooking } from "@/lib/data";
import { formatDate, formatPHP, formatRange } from "@/lib/pricing";
import { site } from "@/lib/config";
import { statusLabel, statusNote, statusTone } from "@/lib/status";

export const metadata: Metadata = { title: "Find my booking" };
export const dynamic = "force-dynamic";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; email?: string; new?: string }>;
}) {
  const { ref, email, new: isNew } = await searchParams;
  const booking = ref && email ? await getBooking(ref, email) : null;
  const lookedUp = Boolean(ref && email);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {booking ? (
        <>
          {isNew ? (
            <div className="mb-6 rounded border border-ok/30 bg-ok-soft px-4 py-3 text-ok">
              <p className="font-semibold">Booking received.</p>
              <p className="text-sm">Save your reference code. You&apos;ll need it with your email to check on this booking.</p>
            </div>
          ) : null}

          <p className="text-sm text-muted">Booking reference</p>
          <h1 className="font-display text-5xl font-bold tracking-tight">{booking.reference}</h1>
          <p className={`mt-4 inline-block rounded-sm px-2.5 py-1 text-sm font-semibold ${statusTone[booking.status]}`}>
            {statusLabel[booking.status]}
          </p>
          <p className="mt-2 max-w-prose text-muted">{statusNote[booking.status]}</p>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Gear and dates</h2>
            <ul className="mt-3 divide-y divide-line rounded border border-line bg-surface">
              {booking.items.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold">{item.camera_name}</p>
                    <p className="text-sm text-muted">
                      {formatRange(item.start_date, item.end_date)} ({item.days} {item.days === 1 ? "day" : "days"} at{" "}
                      {formatPHP(Number(item.daily_rate))})
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatPHP(Number(item.line_total))}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between text-lg font-semibold">
              <span>Rental total</span>
              <span className="tabular-nums">{formatPHP(Number(booking.total))}</span>
            </p>
          </section>

          <section className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold">Your details</h2>
              <p className="mt-2 text-muted">
                {booking.customer_name}
                <br />
                {booking.email}
                <br />
                {booking.phone}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{booking.fulfillment === "pickup" ? "Pickup" : "Delivery"}</h2>
              <p className="mt-2 text-muted">
                {booking.fulfillment === "pickup" ? site.pickupArea : booking.delivery_address}
              </p>
              <p className="mt-1 text-sm text-muted">Booked on {formatDate(booking.created_at.slice(0, 10))}</p>
            </div>
          </section>

          <p className="mt-8 text-sm text-muted">
            Need to change something? Message us on{" "}
            <a className="underline underline-offset-4 hover:text-focus" href={site.contact.messenger}>
              Messenger
            </a>{" "}
            with your reference code.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold">Find my booking</h1>
          <p className="mt-3 max-w-prose text-muted">Enter the reference code from your booking and the email you used.</p>

          {lookedUp ? (
            <p role="alert" className="mt-5 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-warn">
              We couldn&apos;t find a booking with that reference and email. Check both and try again.
            </p>
          ) : null}

          <form action="/booking" method="get" className="mt-6 grid gap-4 rounded border border-line bg-surface p-5 sm:p-6">
            <div>
              <label htmlFor="ref" className="mb-1 block text-sm font-medium">Reference code</label>
              <input id="ref" name="ref" className="field uppercase" placeholder="PX-ABC123" defaultValue={ref} required />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" className="field" defaultValue={email} required />
            </div>
            <button type="submit" className="btn btn-primary">Find booking</button>
          </form>
        </>
      )}
    </div>
  );
}
