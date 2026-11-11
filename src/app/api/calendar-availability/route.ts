import { isValidDate } from "@/lib/pricing";
import { createPublicClient, isDemoMode } from "@/lib/supabase/public";
import { unitsAvailable } from "@/lib/data";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const camera = params.get("camera") ?? "";
  const month = params.get("month") ?? "";
  const start = `${month}-01`;

  if (!camera || !/^\d{4}-\d{2}$/.test(month) || !isValidDate(start)) {
    return Response.json({ error: "Choose a camera and a valid month." }, { status: 400 });
  }

  const startDate = new Date(`${start}T00:00:00Z`);
  if (startDate.toISOString().slice(0, 7) !== month) {
    return Response.json({ error: "Choose a valid month." }, { status: 400 });
  }
  const endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0))
    .toISOString()
    .slice(0, 10);

  try {
    if (!isDemoMode) {
      const { data, error } = await createPublicClient().rpc("camera_calendar_availability", {
        p_camera: camera,
        p_start: start,
        p_end: endDate,
      });
      if (!error) {
        return Response.json({
          days: (data ?? []).map((day: { rental_date: string; available: number }) => ({
            date: day.rental_date,
            available: Number(day.available),
          })),
        });
      }

      const missingFunction =
        error.code === "PGRST202" ||
        error.message.includes("camera_calendar_availability") &&
          (error.message.includes("does not exist") || error.message.includes("schema cache"));
      if (!missingFunction) throw new Error(error.message);
    }

    const days = await Promise.all(
      Array.from({ length: new Date(`${endDate}T00:00:00Z`).getUTCDate() }, (_, index) => {
        const day = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), index + 1))
          .toISOString()
          .slice(0, 10);
        return unitsAvailable(camera, day, day).then((available) => ({ date: day, available }));
      }),
    );
    return Response.json({ days });
  } catch (error) {
    console.error("Failed to load calendar availability:", error);
    return Response.json({ error: "We couldn't load calendar availability. Try again in a moment." }, { status: 500 });
  }
}
