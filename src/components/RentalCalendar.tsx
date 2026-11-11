"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, formatDate, rentalDays, todayManila } from "@/lib/pricing";

type DayAvailability = { date: string; available: number };
type CalendarStep = "pickup" | "return";

function firstOfMonth(date: string) {
  return `${date.slice(0, 7)}-01`;
}

function shiftMonth(date: string, amount: number) {
  const month = new Date(`${firstOfMonth(date)}T00:00:00Z`);
  month.setUTCMonth(month.getUTCMonth() + amount);
  return month.toISOString().slice(0, 7) + "-01";
}

function monthLabel(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${firstOfMonth(date)}T00:00:00Z`));
}

export function RentalCalendar({
  cameraId,
  start,
  end,
  onSelect,
}: {
  cameraId: string;
  start: string;
  end: string;
  onSelect: (date: string, step: CalendarStep) => void;
}) {
  const today = todayManila();
  const [month, setMonth] = useState(() => firstOfMonth(start || today));
  const [availability, setAvailability] = useState<Map<string, number>>(new Map());
  const [loadedMonth, setLoadedMonth] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<{ month: string; message: string } | null>(null);
  const [step, setStep] = useState<CalendarStep>(start ? "return" : "pickup");
  const loading = loadedMonth !== month;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/calendar-availability?camera=${encodeURIComponent(cameraId)}&month=${month.slice(0, 7)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json()) as { days?: DayAvailability[]; error?: string };
        if (!response.ok) throw new Error(body.error ?? "We couldn't load calendar availability.");
        setAvailability(new Map((body.days ?? []).map((day) => [day.date, day.available])));
        setLoadError(null);
        setLoadedMonth(month);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setLoadError({
          month,
          message: error instanceof Error ? error.message : "We couldn't load calendar availability.",
        });
        setLoadedMonth(month);
      });

    return () => controller.abort();
  }, [cameraId, month]);

  const days = useMemo(() => {
    const offset = new Date(`${month}T00:00:00Z`).getUTCDay();
    const gridStart = addDays(month, -offset);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [month]);

  function choose(date: string) {
    const nextStep = step === "pickup" || !start ? "pickup" : "return";
    if (nextStep === "pickup") {
      setStep("return");
      onSelect(date, "pickup");
      return;
    }

    if (date === end) {
      setStep("return");
      onSelect(date, "pickup");
      return;
    }

    if (date <= start) {
      setStep("return");
      onSelect(date, "pickup");
      return;
    }
    if (rentalDays(start, date) > 30) return;
    setStep("return");
    onSelect(date, "return");
  }

  return (
    <section aria-label="Choose rental dates" className="mt-5 border-t border-line pt-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setStep("pickup")}
          aria-pressed={step === "pickup"}
          className={`rounded border px-3 py-2 text-left text-sm ${
            step === "pickup" ? "border-ok bg-ok-soft" : "border-line"
          }`}
        >
          <span className="font-semibold">1. Pickup</span>
          <span className="block text-muted">{start ? formatDate(start) : "Choose pickup day"}</span>
        </button>
        <button
          type="button"
          onClick={() => start && setStep("return")}
          aria-pressed={step === "return"}
          disabled={!start}
          className={`rounded border px-3 py-2 text-left text-sm disabled:opacity-50 ${
            step === "return" ? "border-ok bg-ok-soft" : "border-line"
          }`}
        >
          <span className="font-semibold">2. Return</span>
          <span className="block text-muted">{end ? formatDate(end) : "Choose a later day"}</span>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold">Dates</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
            disabled={month <= firstOfMonth(today)}
            aria-label="Previous month"
            className="rounded px-2 py-1 hover:bg-paper disabled:opacity-30"
          >
            &larr;
          </button>
          <h3 aria-live="polite" className="min-w-32 text-center text-sm font-semibold">
            {monthLabel(month)}
          </h3>
          <button
            type="button"
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
            aria-label="Next month"
            className="rounded px-2 py-1 hover:bg-paper"
          >
            &rarr;
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-xs text-muted" aria-hidden="true">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="py-2">{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1" aria-busy={loading}>
        {days.map((date) => {
          const inMonth = date.slice(0, 7) === month.slice(0, 7);
          if (!inMonth) return <span key={date} aria-hidden="true" className="aspect-square" />;

          const available = availability.get(date);
          const isUnavailable = available === 0;
          const tooLong =
            step === "return" && Boolean(start) && date >= start && rentalDays(start, date) > 30;
          const outsideRange = Boolean(start && end && date > start && date < end);
          const selected = date === start || date === end;
          const disabled = loading || available === undefined || date < today || isUnavailable || tooLong;

          return (
            <button
              key={date}
              type="button"
              onClick={() => choose(date)}
              disabled={disabled}
              aria-label={`${formatDate(date)}${isUnavailable ? ", unavailable" : available === undefined ? "" : ", available"}`}
              aria-pressed={selected}
              title={isUnavailable ? "Unavailable" : available === undefined ? "Checking availability" : `${available} available`}
              className={`aspect-square rounded text-sm transition-colors ${
                selected
                  ? "bg-ink font-semibold text-white"
                  : outsideRange
                    ? "bg-focus-soft text-ink"
                    : isUnavailable
                      ? "cursor-not-allowed bg-line/60 text-muted/50 line-through"
                      : "hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
              }`}
            >
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-surface ring-1 ring-line" /> Available</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-line" /> Unavailable</span>
      </div>
      {loadError?.month === month ? <p role="alert" className="mt-2 text-sm text-warn">{loadError.message}</p> : null}
    </section>
  );
}
