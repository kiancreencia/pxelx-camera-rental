"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { placeBooking } from "@/app/cart/actions";
import { useCart } from "@/lib/cart-store";
import { site } from "@/lib/config";
import { formatPHP, formatRange, rentalDays } from "@/lib/pricing";
import type { CustomerDetails } from "@/lib/types";

const blank: CustomerDetails = { name: "", email: "", phone: "", fulfillment: "pickup", address: "", notes: "" };

export function CartView({ accountEmail, accountName }: { accountEmail: string; accountName: string }) {
  const cart = useCart();
  const router = useRouter();
  const [form, setForm] = useState<CustomerDetails>({ ...blank, name: accountName, email: accountEmail });
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const subtotal = cart.lines.reduce((sum, l) => sum + l.dailyRate * rentalDays(l.startDate, l.endDate), 0);
  const deposits = cart.lines.reduce((sum, l) => sum + l.deposit, 0);

  if (cart.lines.length === 0) {
    return (
      <div className="rounded border border-line bg-surface p-8">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-muted">Pick your dates and add a camera to start a booking.</p>
        <Link href="/cameras" className="btn btn-primary mt-5">
          Browse cameras
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await placeBooking(form, cart.lines);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      cart.clear();
      router.push(`/booking?ref=${encodeURIComponent(result.reference)}&email=${encodeURIComponent(result.email)}&new=1`);
    } catch {
      setError("We couldn't send your booking. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section aria-labelledby="items-heading">
        <h2 id="items-heading" className="text-xl font-semibold">Your gear</h2>
        <ul className="mt-4 divide-y divide-line rounded border border-line bg-surface">
          {cart.lines.map((line, i) => {
            const days = rentalDays(line.startDate, line.endDate);
            return (
              <li key={`${line.cameraId}-${line.startDate}-${line.endDate}`} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <Link href={`/cameras/${line.slug}`} className="font-semibold hover:underline">
                    {line.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {formatRange(line.startDate, line.endDate)} ({days} {days === 1 ? "day" : "days"} at{" "}
                    {formatPHP(line.dailyRate)})
                  </p>
                  <button
                    type="button"
                    onClick={() => cart.remove(i)}
                    className="mt-1 text-sm text-muted underline underline-offset-4 hover:text-focus"
                  >
                    Remove {line.name}
                  </button>
                </div>
                <p className="font-semibold tabular-nums">{formatPHP(line.dailyRate * days)}</p>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-1">
          <div className="flex justify-between text-lg font-semibold">
            <dt>Rental total</dt>
            <dd className="tabular-nums">{formatPHP(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <dt>Refundable deposit (collected separately)</dt>
            <dd className="tabular-nums">{formatPHP(deposits)}</dd>
          </div>
        </dl>
      </section>

      <form onSubmit={submit} className="space-y-4 rounded border border-line bg-surface p-5 sm:p-6" noValidate>
        <h2 className="text-xl font-semibold">Your details</h2>

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Full name</label>
          <input id="name" className="field" autoComplete="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              className="field"
              autoComplete="email"
              required
              readOnly={Boolean(accountEmail)}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">Mobile number</label>
            <input id="phone" type="tel" className="field" autoComplete="tel" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">How will you get it?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["pickup", "delivery"] as const).map((value) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2.5 ${
                  form.fulfillment === value ? "border-ink bg-paper" : "border-line"
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value={value}
                  checked={form.fulfillment === value}
                  onChange={() => set("fulfillment", value)}
                  className="accent-[var(--focus)]"
                />
                {value === "pickup" ? "I'll pick it up" : "Deliver it to me"}
              </label>
            ))}
          </div>
          {form.fulfillment === "pickup" ? (
            <p className="mt-2 text-sm text-muted">Pickup: {site.pickupArea}</p>
          ) : null}
        </fieldset>

        {form.fulfillment === "delivery" ? (
          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-medium">Delivery address</label>
            <textarea id="address" className="field" rows={3} value={form.address} onChange={(e) => set("address", e.target.value)} />
            <p className="mt-1 text-sm text-muted">We quote the courier fee when we confirm your booking.</p>
          </div>
        ) : null}

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">Anything we should know? (optional)</label>
          <textarea id="notes" className="field" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-[var(--focus)]"
          />
          <span>I&apos;m 18 or older and agree to the rental terms.</span>
        </label>

        <div aria-live="polite">
          {error ? (
            <p role="alert" className="rounded border border-warn/30 bg-warn-soft px-3 py-2 text-sm text-warn">
              {error}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={busy || !agreed}>
          {busy ? "Sending booking..." : "Send booking"}
        </button>
        <p className="text-sm text-muted">
          You won&apos;t be charged yet. We&apos;ll confirm your booking and message you the payment steps.
        </p>
      </form>
    </div>
  );
}
