import { demoCameras, demoCategories } from "./seed";
import { createPublicClient, isDemoMode } from "./supabase/public";
import type { BookingView, Camera, CameraWithStock, Category } from "./types";

type CameraRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  daily_rate: number | string;
  deposit: number | string;
  quantity: number;
  includes: string[];
  image_url: string | null;
  categories: { slug: string; name: string } | null;
};

const CAMERA_COLUMNS =
  "id, slug, name, brand, tagline, description, daily_rate, deposit, quantity, includes, image_url, categories(slug, name)";

function toCamera(row: CameraRow): Camera {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    tagline: row.tagline,
    description: row.description,
    dailyRate: Number(row.daily_rate),
    deposit: Number(row.deposit),
    quantity: row.quantity,
    includes: row.includes ?? [],
    imageUrl: row.image_url,
    categorySlug: row.categories?.slug ?? "other",
    categoryName: row.categories?.name ?? "Other",
  };
}

export async function getCategories(): Promise<Category[]> {
  if (isDemoMode) return demoCategories;
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("slug, name")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Units free on every day of start..end. */
export async function unitsAvailable(cameraId: string, start: string, end: string): Promise<number> {
  if (isDemoMode) return demoCameras.find((c) => c.id === cameraId)?.quantity ?? 0;
  const { data, error } = await createPublicClient().rpc("units_available", {
    p_camera: cameraId,
    p_start: start,
    p_end: end,
  });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export async function getCameras(opts: {
  category?: string;
  start?: string;
  end?: string;
} = {}): Promise<CameraWithStock[]> {
  let cameras: Camera[];

  if (isDemoMode) {
    cameras = demoCameras.filter((c) => !opts.category || c.categorySlug === opts.category);
  } else {
    const { data, error } = await createPublicClient()
      .from("cameras")
      .select(CAMERA_COLUMNS)
      .order("daily_rate", { ascending: true })
      .returns<CameraRow[]>();
    if (error) throw new Error(error.message);
    cameras = (data ?? []).map(toCamera).filter((c) => !opts.category || c.categorySlug === opts.category);
  }

  const { start, end } = opts;
  if (!start || !end) return cameras.map((c) => ({ ...c, available: null }));

  return Promise.all(
    cameras.map(async (c) => ({ ...c, available: await unitsAvailable(c.id, start, end) })),
  );
}

export async function getCamera(slug: string): Promise<Camera | null> {
  if (isDemoMode) return demoCameras.find((c) => c.slug === slug) ?? null;
  const { data, error } = await createPublicClient()
    .from("cameras")
    .select(CAMERA_COLUMNS)
    .eq("slug", slug)
    .maybeSingle<CameraRow>();
  if (error) throw new Error(error.message);
  return data ? toCamera(data) : null;
}

export async function getBooking(reference: string, email: string): Promise<BookingView | null> {
  if (isDemoMode) return null;
  const { data, error } = await createPublicClient().rpc("get_booking", {
    p_reference: reference,
    p_email: email,
  });
  if (error) throw new Error(error.message);
  return (data as BookingView | null) ?? null;
}
