import type { Metadata } from "next";
import Link from "next/link";
import { CameraCard } from "@/components/CameraCard";
import { DateRangeForm } from "@/components/DateRangeForm";
import { site } from "@/lib/config";
import { getCameras, getCategories } from "@/lib/data";
import { formatRange, isValidDate, rentalDays, todayManila } from "@/lib/pricing";

export const metadata: Metadata = { title: "Cameras for rent" };
export const dynamic = "force-dynamic";

type SearchParams = { category?: string; start?: string; end?: string };

export default async function CamerasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const category = params.category;
  const today = todayManila();

  let start: string | undefined;
  let end: string | undefined;
  let dateProblem: string | null = null;

  if (params.start || params.end) {
    if (!isValidDate(params.start) || !isValidDate(params.end)) {
      dateProblem = "Choose both a pick-up date and a return date.";
    } else if (params.start < today) {
      dateProblem = "Pick-up can't be in the past. Choose today or a later date.";
    } else if (params.end < params.start) {
      dateProblem = "Your return date is before your pick-up date. Swap them or choose a later return.";
    } else if (rentalDays(params.start, params.end) > site.maxRentalDays) {
      dateProblem = `Rentals can be up to ${site.maxRentalDays} days online. Message us for longer rentals.`;
    } else {
      start = params.start;
      end = params.end;
    }
  }

  const [cameras, categories] = await Promise.all([getCameras({ category, start, end }), getCategories()]);
  const shown = start && end ? [...cameras].sort((a, b) => Number((b.available ?? 0) > 0) - Number((a.available ?? 0) > 0)) : cameras;
  const days = start && end ? rentalDays(start, end) : 0;

  const filterHref = (slug?: string) => {
    const q = new URLSearchParams();
    if (slug) q.set("category", slug);
    if (start && end) {
      q.set("start", start);
      q.set("end", end);
    }
    const qs = q.toString();
    return `/cameras${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Cameras for rent</h1>

      <div className="mt-6 grid gap-6 rounded border border-line bg-surface p-5 md:grid-cols-[1fr_1.2fr] md:items-end">
        <p className="text-muted">
          {start && end
            ? `Showing availability for ${formatRange(start, end)} (${days} ${days === 1 ? "day" : "days"}).`
            : "Choose your dates to see which cameras are free."}
        </p>
        <DateRangeForm start={start} end={end} category={category} buttonLabel="Update dates" idPrefix="catalog" />
      </div>

      {dateProblem ? (
        <p role="alert" className="mt-4 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-warn">
          {dateProblem}
        </p>
      ) : null}

      <nav aria-label="Filter by type" className="mt-8 flex flex-wrap gap-2">
        {[{ slug: undefined, name: "All" }, ...categories].map((c) => {
          const active = (c.slug ?? undefined) === category;
          return (
            <Link
              key={c.slug ?? "all"}
              href={filterHref(c.slug)}
              aria-current={active ? "page" : undefined}
              className={`rounded border px-3 py-1.5 text-sm font-medium ${
                active ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-10 text-muted">
          Nothing in this category yet.{" "}
          <Link className="underline underline-offset-4" href={filterHref()}>
            Show all cameras
          </Link>
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((camera) => (
            <li key={camera.id} className="contents">
              <CameraCard camera={camera} start={start} end={end} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
