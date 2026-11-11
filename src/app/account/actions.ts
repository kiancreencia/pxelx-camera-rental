"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signIn(formData: FormData) {
  if (isDemoMode) redirect("/account/login?error=not_configured");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL.test(email) || !password) redirect("/account/login?error=credentials");

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/account/login?error=credentials");
  redirect("/cart");
}

export async function signInWithGoogle() {
  if (isDemoMode) redirect("/account/login?error=not_configured");

  const origin = (await headers()).get("origin");
  if (!origin) redirect("/account/login?error=setup");

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: new URL("/auth/callback", origin).toString() },
  });
  if (error) {
    if (error.message.toLowerCase().includes("provider is not enabled")) {
      redirect("/account/login?error=google_not_enabled");
    }
    redirect("/account/login?error=oauth");
  }
  if (!data.url) redirect("/account/login?error=oauth");
  redirect(data.url);
}

export async function signUp(formData: FormData) {
  if (isDemoMode) redirect("/account/signup?error=not_configured");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (name.length < 2 || name.length > 120 || !EMAIL.test(email) || password.length < 8) {
    redirect("/account/signup?error=invalid");
  }

  const origin = (await headers()).get("origin");
  if (!origin) redirect("/account/signup?error=setup");

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: new URL("/auth/callback", origin).toString(),
    },
  });
  if (error) redirect("/account/signup?error=signup");
  if (!data.session) redirect("/account/signup?message=check_email");
  redirect("/cart");
}

export async function signOut() {
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  redirect("/account/login");
}
