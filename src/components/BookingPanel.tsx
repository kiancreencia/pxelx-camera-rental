"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/config";
import { useCart } from "@/lib/cart-store";
import { formatPHP, formatRange, rentalDailyRate, rentalDays, rentalRateNote, todayManila } from "@/lib/pricing";
import type { Camera } from "@/lib/types";
import { RentalCalendar } from "./RentalCalendar";

type Result = { kind: "added" } | { kind: "error"; message: string } | null;

export function BookingPanel({
  camera,
  defaultStart,
  defaultEnd,
}: {
  camera: Camera;
  defaultStart?: string;
  defaultEnd?: string;
}) {
  const cart = useCart();
  const today = todayManila();
  const [start, setStart] = useState(defaultStart ?? "");
  const [end, setEnd] = useState(defaultEnd ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const days = start && end ? rentalDays(start, end) : 0;
  const dailyRate = days > 0 ? rentalDailyRate(camera.slug, camera.dailyRate, days) : camera.dailyRate;
  const total = days * dailyRate;
  const rateNote = rentalRateNote(camera.slug, days);

  function selectDate(date: string, step: "pickup" | "return") {
    if (step === "pickup") {
      setStart(date);
      setEnd("");
    } else {
      setEnd(date);
    }
    setResult(null);
  }

  function validate(): string | null {
    if (!start || !end) return "Choose a pick-up and a return date.";
    if (start < today) return "Pick-up can't be in the past.";
    if (end < start) return "Your return date is before your pick-up date.";
    if (days > site.maxRentalDays) return `Rentals can be up to ${site.maxRentalDays} days online. Message us for longer rentals.`;
    return null;
  }

  async function addToCart(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) return setResult({ kind: "error", message: problem });

    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/availability?camera=${encodeURIComponent(camera.id)}&start=${start}&end=${end}`,
      );
      const body = (await res.json()) as { available?: number; error?: string };
      if (!res.ok) throw new Error(body.error ?? "We couldn't check availability.");
      if (!body.available || body.available < 1) {
        setResult({
          kind: "error",
          message: `Not free for ${formatRange(start, end)}. Try other dates or another camera.`,
        });
        return;
      }
      cart.add({
        cameraId: camera.id,
        slug: camera.slug,
        name: camera.name,
        dailyRate: camera.dailyRate,
        deposit: camera.deposit,
        startDate: start,
        endDate: end,
      });
      setResult({ kind: "added" });
    } catch (err) {
      setResult({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={addToCart} className="viewfinder p-6" noValidate>
      <div className="focus-box absolute right-5 top-5 size-6 border-2 border-focus" aria-hidden="true" />
      <p className="pr-10 font-display text-3xl font-bold tabular-nums">
        {formatPHP(dailyRate)}
        <span className="text-base font-normal text-muted"> a day</span>
      </p>
      {rateNote ? <p className="mt-1 text-sm text-muted">{rateNote}</p> : null}

      <RentalCalendar cameraId={camera.id} start={start} end={end} onSelect={selectDate} />

      <dl className="mt-5 space-y-1 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Rental days</dt>
          <dd className="tabular-nums">{days > 0 ? days : "Choose dates"}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt>Rental total</dt>
          <dd className="tabular-nums">{days > 0 ? formatPHP(total) : "-"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Refundable deposit</dt>
          <dd className="tabular-nums">{formatPHP(camera.deposit)}</dd>
        </div>
      </dl>

      <button type="submit" className="btn btn-primary mt-5 w-full" disabled={busy}>
        {busy ? "Checking dates..." : "Add to cart"}
      </button>

      <div aria-live="polite" className="mt-3 min-h-6 text-sm">
        {result?.kind === "error" ? <p className="text-warn">{result.message}</p> : null}
        {result?.kind === "added" ? (
          <p className="text-ok">
            Added for {formatRange(start, end)}.{" "}
            <Link href="/cart" className="font-semibold underline underline-offset-4">
              Go to cart
            </Link>
          </p>
        ) : null}
      </div>
      <div className="vf-corner-b" aria-hidden="true" />
    </form>
  );
}
