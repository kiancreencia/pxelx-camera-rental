"use client";

import Link from "next/link";
import { useState } from "react";
import { CameraArt } from "@/components/CameraArt";
import { formatPHP } from "@/lib/pricing";
import type { Camera } from "@/lib/types";

export function FeaturedGearCarousel({ cameras }: { cameras: Camera[] }) {
  const [index, setIndex] = useState(0);

  if (cameras.length === 0) return null;

  const camera = cameras[index];
  const showNext = () => setIndex((current) => (current + 1) % cameras.length);
  const showPrevious = () => setIndex((current) => (current - 1 + cameras.length) % cameras.length);

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="group relative">
        <span className="absolute -inset-2 rotate-2 rounded-[1.5rem] bg-[#c62828]/70 transition-transform duration-300 group-hover:rotate-1" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[1.25rem] border border-white/15 bg-[#e5e5e5] shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
          <button
            type="button"
            onClick={showNext}
            aria-label={`Show next featured gear after ${camera.name}`}
            className="block aspect-square w-full focus-visible:outline-offset-[-4px]"
          >
            {camera.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={camera.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <CameraArt seed={camera.slug} />
            )}
          </button>
          <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 text-[#171717]">
            <div className="min-w-0">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#c62828]">Featured gear</p>
              <p className="truncate font-display text-base font-bold">{camera.name}</p>
              <p className="text-xs text-[#666]">{formatPHP(camera.dailyRate)} / day</p>
            </div>
            <Link
              href={`/cameras/${camera.slug}`}
              className="shrink-0 rounded-full bg-[#f2f2f2] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#c62828] hover:text-white"
            >
              View gear <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mt-3 flex items-center justify-between text-xs text-white/70">
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Show previous featured gear"
          className="rounded-full border border-white/20 px-3 py-1.5 transition-colors hover:bg-white/10"
        >
          ← Previous
        </button>
        <span aria-live="polite" className="tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(cameras.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={showNext}
          aria-label="Show next featured gear"
          className="rounded-full border border-white/20 px-3 py-1.5 transition-colors hover:bg-white/10"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
