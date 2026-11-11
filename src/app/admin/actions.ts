"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";
import { allStatuses } from "@/lib/status";
import type { BookingStatus } from "@/lib/types";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=credentials");

  const { data: profile } = await supabase.from("profiles").select("is_admin").maybeSingle();
  if (!profile?.is_admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=access");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  if (!id || !allStatuses.includes(status)) return;

  const supabase = await createSessionClient();
  // Row level security only lets admins update bookings, so a non-admin call changes nothing.
  await supabase.from("bookings").update({ status }).eq("id", id);
  revalidatePath("/admin");
}
