"use server";

import { isDemoMode } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";
import type { CartLine, CustomerDetails } from "@/lib/types";

export type PlaceBookingResult =
  | { ok: true; reference: string; email: string }
  | { ok: false; error: string };

type LineInput = Pick<CartLine, "cameraId" | "startDate" | "endDate">;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function placeBooking(customer: CustomerDetails, lines: LineInput[]): Promise<PlaceBookingResult> {
  if (isDemoMode) {
    return {
      ok: false,
      error: "Booking isn't connected yet. Add your Supabase keys to .env.local to turn it on.",
    };
  }

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "Sign in with an email address before booking." };

  const name = customer.name?.trim() ?? "";
  const email = user.email.trim().toLowerCase();
  const phone = customer.phone?.trim() ?? "";
  const address = customer.address?.trim() ?? "";
  const notes = customer.notes?.trim() ?? "";

  if (!name || name.length > 120) return { ok: false, error: "Enter your full name." };
  if (!EMAIL.test(email) || email.length > 200) return { ok: false, error: "Enter a valid email address." };
  if (phone.replace(/\D/g, "").length < 7 || phone.length > 30) {
    return { ok: false, error: "Enter a phone number we can reach you on." };
  }
  if (customer.fulfillment !== "pickup" && customer.fulfillment !== "delivery") {
    return { ok: false, error: "Choose pickup or delivery." };
  }
  if (customer.fulfillment === "delivery" && !address) {
    return { ok: false, error: "Enter a delivery address." };
  }
  if (address.length > 400 || notes.length > 1000) return { ok: false, error: "Address or notes are too long." };
  if (!Array.isArray(lines) || lines.length === 0) return { ok: false, error: "Your cart is empty." };

  const { data, error } = await supabase.rpc("create_customer_booking", {
    p_customer: { name, email, phone, fulfillment: customer.fulfillment, address, notes },
    p_items: lines.map((l) => ({ camera_id: l.cameraId, start_date: l.startDate, end_date: l.endDate })),
  });

  if (error) {
    // The database raises plain-language messages (not available, dates in the past, and so on).
    return { ok: false, error: error.message };
  }

  const reference = (data as { reference?: string } | null)?.reference;
  if (!reference) return { ok: false, error: "We couldn't save your booking. Try again." };
  return { ok: true, reference, email };
}
