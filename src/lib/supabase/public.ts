import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(url: string | undefined) {
  if (!url) return undefined;
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** True when no Supabase project is configured; the site then runs on demo data. */
export const isDemoMode = !supabaseUrl || !supabaseKey;

/** Stateless anon client for public reads and the booking RPCs (no cookies, no session). */
export function createPublicClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase is not configured. Copy .env.example to .env.local and fill it in.");
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
