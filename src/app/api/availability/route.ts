import { site } from "@/lib/config";
import { unitsAvailable } from "@/lib/data";
import { isValidDate, rentalDays, todayManila } from "@/lib/pricing";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const camera = params.get("camera") ?? "";
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";

  if (!camera || !isValidDate(start) || !isValidDate(end)) {
    return Response.json({ error: "Choose a pick-up and return date." }, { status: 400 });
  }
  if (start < todayManila()) {
    return Response.json({ error: "Pick-up can't be in the past." }, { status: 400 });
  }
  const days = rentalDays(start, end);
  if (days < 1) {
    return Response.json({ error: "Your return date is before your pick-up date." }, { status: 400 });
  }
  if (days > site.maxRentalDays) {
    return Response.json({ error: `Rentals can be up to ${site.maxRentalDays} days online.` }, { status: 400 });
  }

  try {
    const available = await unitsAvailable(camera, start, end);
    return Response.json({ available });
  } catch {
    return Response.json({ error: "We couldn't check availability. Try again in a moment." }, { status: 500 });
  }
}
