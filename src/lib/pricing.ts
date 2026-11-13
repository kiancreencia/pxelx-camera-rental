const DAY_MS = 86_400_000;

const durationPricingSlugs = new Set([
  "sony-a6400",
  "dji-osmo-nano",
  "insta360-x5",
  "dji-osmo-pocket-3",
  "insta360-ace-pro-2",
  "canon-s95",
  "canon-sx740-hs",
]);

export function rentalDailyRate(slug: string, baseRate: number, days: number): number {
  if (!durationPricingSlugs.has(slug)) return baseRate;
  if (days === 1) return baseRate + 50;
  if (days >= 5) return baseRate - (slug === "canon-s95" ? 20 : 50);
  return baseRate;
}

export function rentalRateNote(slug: string, days: number): string | null {
  if (!durationPricingSlugs.has(slug)) return null;
  if (days === 1) return "Includes a ₱50 one-day surcharge.";
  if (days >= 5) {
    const discount = slug === "canon-s95" ? 20 : 50;
    return `Includes ₱${discount} off per day for rentals of 5+ days.`;
  }
  return null;
}

/** Calendar days in the rental, counting both the first and last date. */
export function rentalDays(start: string, end: string): number {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / DAY_MS) + 1;
}

/** Today's date in Manila as YYYY-MM-DD, the day a rental can start at the earliest. */
export function todayManila(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
}

export function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00Z`) + days * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatRange(start: string, end: string): string {
  return start === end ? formatDate(start) : `${formatDate(start)} to ${formatDate(end)}`;
}

export function isValidDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}
