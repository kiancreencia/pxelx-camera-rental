import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { updateStatus } from "./actions";
import { formatDate, formatPHP, formatRange } from "@/lib/pricing";
import { allStatuses, statusLabel, statusTone } from "@/lib/status";
import { isDemoMode } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Bookings", robots: { index: false } };
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  reference: string;
  customer_name: string;
  email: string;
  phone: string;
  fulfillment: "pickup" | "delivery";
  delivery_address: string | null;
  notes: string | null;
  status: BookingStatus;
  total: number | string;
  created_at: string;
  booking_items: { start_date: string; end_date: string; days: number; cameras: { name: string } | null }[];
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (isDemoMode) redirect("/admin/login");

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").maybeSingle();
  if (!profile?.is_admin) redirect("/admin/login?error=access");

  const { status: filter } = await searchParams;
  const activeFilter = allStatuses.find((s) => s === filter);

  let query = supabase
    .from("bookings")
    .select(
      "id, reference, customer_name, email, phone, fulfillment, delivery_address, notes, status, total, created_at, booking_items(start_date, end_date, days, cameras(name))",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (activeFilter) query = query.eq("status", activeFilter);
  const { data, error } = await query.returns<Row[]>();
  if (error) throw new Error(error.message);
  const bookings = data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Bookings</h1>

      <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
        {[{ value: undefined, label: "All" }, ...allStatuses.map((s) => ({ value: s, label: statusLabel[s] }))].map((f) => (
          <a
            key={f.value ?? "all"}
            href={f.value ? `/admin?status=${f.value}` : "/admin"}
            aria-current={activeFilter === f.value ? "page" : undefined}
            className={`rounded border px-3 py-1.5 text-sm font-medium ${
              activeFilter === f.value ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink"
            }`}
          >
            {f.label}
          </a>
        ))}
      </nav>

      {bookings.length === 0 ? (
        <p className="mt-10 text-muted">No bookings here yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="rounded border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-bold">{b.reference}</p>
                  <p className="text-sm text-muted">Received {formatDate(b.created_at.slice(0, 10))}</p>
                </div>
                <p className={`rounded-sm px-2.5 py-1 text-sm font-semibold ${statusTone[b.status]}`}>
                  {statusLabel[b.status]}
                </p>
              </div>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold">Customer</h2>
                  <p className="text-sm text-muted">
                    {b.customer_name}
                    <br />
                    <a className="underline underline-offset-4" href={`mailto:${b.email}`}>{b.email}</a>
                    <br />
                    <a className="underline underline-offset-4" href={`tel:${b.phone}`}>{b.phone}</a>
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {b.fulfillment === "pickup" ? "Pickup" : `Delivery to ${b.delivery_address ?? ""}`}
                  </p>
                  {b.notes ? <p className="mt-2 text-sm">Note: {b.notes}</p> : null}
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Gear</h2>
                  <ul className="text-sm text-muted">
                    {b.booking_items.map((item, i) => (
                      <li key={i}>
                        {item.cameras?.name ?? "Removed item"}, {formatRange(item.start_date, item.end_date)} ({item.days}{" "}
                        {item.days === 1 ? "day" : "days"})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-semibold tabular-nums">{formatPHP(Number(b.total))}</p>
                </div>
              </div>

              <form action={updateStatus} className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                <input type="hidden" name="id" value={b.id} />
                <div>
                  <label htmlFor={`status-${b.id}`} className="mb-1 block text-sm font-medium">Status</label>
                  <select id={`status-${b.id}`} name="status" defaultValue={b.status} className="field w-auto min-w-48">
                    {allStatuses.map((s) => (
                      <option key={s} value={s}>{statusLabel[s]}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Save status</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
