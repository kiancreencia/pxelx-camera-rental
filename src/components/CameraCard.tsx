import Link from "next/link";
import { CameraArt } from "./CameraArt";
import { formatPHP, rentalDailyRate, rentalDays } from "@/lib/pricing";
import type { CameraWithStock } from "@/lib/types";

export function CameraCard({ camera, start, end }: { camera: CameraWithStock; start?: string; end?: string }) {
  const query = start && end ? `?start=${start}&end=${end}` : "";
  const unavailable = camera.available !== null && camera.available < 1;
  const days = start && end ? rentalDays(start, end) : 0;
  const dailyRate = days > 0 ? rentalDailyRate(camera.slug, camera.dailyRate, days) : camera.dailyRate;

  return (
    <Link
      href={`/cameras/${camera.slug}${query}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-[#d8d8d8] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#999] hover:shadow-lg ${
        unavailable ? "opacity-70" : ""
      }`}
    >
      <div className="aspect-square overflow-hidden bg-[#e5e5e5]">
        {camera.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={camera.imageUrl} alt={camera.name} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <CameraArt seed={camera.slug} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#777]">{camera.categoryName}</p>
        <h3 className="text-lg font-bold text-[#222] group-hover:underline">{camera.name}</h3>
        <p className="line-clamp-2 min-h-11 text-sm leading-5 text-[#666]">{camera.tagline}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t border-[#ededed] pt-3">
          <p className="text-sm font-semibold text-[#222]">
            {days > 0 ? "Rent at " : "Rent as low as "}
            <span className="tabular-nums">{formatPHP(dailyRate)}</span>
            <span className="font-normal text-[#777]">/day</span>
          </p>
          {camera.available !== null ? (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                unavailable ? "bg-warn-soft text-warn" : "bg-[#ededed] text-[#444]"
              }`}
            >
              {unavailable ? "Booked for these dates" : "Free for your dates"}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
