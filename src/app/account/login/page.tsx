import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signIn, signInWithGoogle } from "../actions";
import { isDemoMode } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Customer sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  credentials: "That email or password isn't right.",
  callback: "We couldn't confirm your email. Please sign in and try again.",
  not_configured: "Customer sign-in is unavailable until Supabase is configured.",
  setup: "We couldn't start sign-in. Please try again.",
  oauth: "We couldn't start Google sign-in. Please try again.",
  google_not_enabled:
    "Google sign-in isn't enabled for this Supabase project. Ask the site administrator to enable the Google provider in Supabase Authentication settings.",
};

export default async function CustomerLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!isDemoMode) {
    const {
      data: { user },
    } = await (await createSessionClient()).auth.getUser();
    if (user) redirect("/cart");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold">Customer sign in</h1>
      <p className="mt-2 text-muted">Sign in to continue with your camera booking.</p>
      {isDemoMode ? (
        <p className="mt-4 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          Supabase isn&apos;t configured yet, so customer sign-in is off. Add your keys to <code>.env.local</code>.
        </p>
      ) : null}
      {error && messages[error] ? (
        <p role="alert" className="mt-4 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          {messages[error]}
        </p>
      ) : null}
      <form action={signInWithGoogle} className="mt-6">
        <button
          type="submit"
          className="btn btn-quiet w-full border border-line"
          disabled={isDemoMode}
        >
          Continue with Google
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>or use email</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <form action={signIn} className="grid gap-4 rounded border border-line bg-surface p-5 sm:p-6">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" className="field" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isDemoMode}>Sign in</button>
      </form>
      <p className="mt-5 text-sm text-muted">
        New here?{" "}
        <Link href="/account/signup" className="font-semibold underline underline-offset-4">Create an account</Link>
      </p>
    </div>
  );
}
