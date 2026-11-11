export type Category = {
  slug: string;
  name: string;
};

export type Camera = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  dailyRate: number;
  deposit: number;
  quantity: number;
  includes: string[];
  imageUrl: string | null;
  categorySlug: string;
  categoryName: string;
};

export type CameraWithStock = Camera & {
  /** Units free for the whole searched range. null when no dates were searched. */
  available: number | null;
};

export type CartLine = {
  cameraId: string;
  slug: string;
  name: string;
  dailyRate: number;
  deposit: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

export type Fulfillment = "pickup" | "delivery";

export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
  fulfillment: Fulfillment;
  address: string;
  notes: string;
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "returned"
  | "cancelled";

export type BookingView = {
  reference: string;
  status: BookingStatus;
  customer_name: string;
  email: string;
  phone: string;
  fulfillment: Fulfillment;
  delivery_address: string | null;
  notes: string | null;
  total: number;
  created_at: string;
  items: {
    camera_name: string;
    start_date: string;
    end_date: string;
    days: number;
    daily_rate: number;
    line_total: number;
  }[];
};
