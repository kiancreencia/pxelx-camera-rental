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
    <div className="camera-catalog min-h-full px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#777]">pxelx camera rental</p>
          <h1 className="mt-2 text-4xl font-bold text-[#171717] sm:text-5xl">Gears for Great Memories.</h1>
          <p className="mt-3 max-w-xl text-base text-[#666]">
            Pick your camera, choose your dates, and add what you need.
          </p>
        </div>

        {dateProblem ? (
          <p role="alert" className="mt-4 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-warn">
            {dateProblem}
          </p>
        ) : null}

        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#777]">Browse by type</p>
          <nav aria-label="Filter by type" className="flex flex-wrap gap-2">
            {[{ slug: undefined, name: "All cameras" }, ...categories].map((c) => {
              const active = (c.slug ?? undefined) === category;
              return (
                <Link
                  key={c.slug ?? "all"}
                  href={filterHref(c.slug)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-[#c62828] bg-[#c62828] text-white"
                      : "border-[#d2d2d2] bg-white/70 text-[#333] hover:border-[#c62828]"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {shown.length === 0 ? (
          <p className="mt-10 text-muted">
            Nothing in this category yet.{" "}
            <Link className="underline underline-offset-4" href={filterHref()}>
              Show all cameras
            </Link>
          </p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((camera) => (
              <li key={camera.id} className="contents">
                <CameraCard camera={camera} start={start} end={end} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
