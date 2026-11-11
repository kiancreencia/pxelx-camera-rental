import Link from "next/link";
import { CameraArt } from "./CameraArt";
import { formatPHP } from "@/lib/pricing";
import type { CameraWithStock } from "@/lib/types";

export function CameraCard({ camera, start, end }: { camera: CameraWithStock; start?: string; end?: string }) {
  const query = start && end ? `?start=${start}&end=${end}` : "";
  const unavailable = camera.available !== null && camera.available < 1;

  return (
    <Link
      href={`/cameras/${camera.slug}${query}`}
      className={`group flex flex-col overflow-hidden rounded border border-line bg-surface transition-colors hover:border-ink ${
        unavailable ? "opacity-70" : ""
      }`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-paper">
        {camera.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={camera.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <CameraArt seed={camera.slug} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-sm text-muted">{camera.brand}</p>
        <h3 className="text-lg font-semibold group-hover:underline">{camera.name}</h3>
        <p className="text-sm text-muted">{camera.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p>
            <span className="text-lg font-semibold tabular-nums">{formatPHP(camera.dailyRate)}</span>
            <span className="text-sm text-muted"> a day</span>
          </p>
          {camera.available !== null ? (
            <span
              className={`rounded-sm px-2 py-0.5 text-sm font-medium ${
                unavailable ? "bg-warn-soft text-warn" : "bg-ok-soft text-ok"
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
