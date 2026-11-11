import { todayManila } from "@/lib/pricing";

/** Plain GET form: sends the dates to /cameras, which shows what's free. No JavaScript needed. */
export function DateRangeForm({
  start,
  end,
  category,
  buttonLabel = "See what's free",
  idPrefix = "range",
}: {
  start?: string;
  end?: string;
  category?: string;
  buttonLabel?: string;
  idPrefix?: string;
}) {
  const today = todayManila();
  return (
    <form action="/cameras" method="get" className="grid gap-3 sm:grid-cols-2">
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <div>
        <label htmlFor={`${idPrefix}-start`} className="mb-1 block text-sm font-medium">
          Pick up
        </label>
        <input id={`${idPrefix}-start`} className="field" type="date" name="start" min={today} defaultValue={start} required />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-end`} className="mb-1 block text-sm font-medium">
          Return
        </label>
        <input id={`${idPrefix}-end`} className="field" type="date" name="end" min={start ?? today} defaultValue={end} required />
      </div>
      <button type="submit" className="btn btn-primary sm:col-span-2">
        {buttonLabel}
      </button>
    </form>
  );
}
