import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signUp } from "../actions";
import { isDemoMode } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Create a customer account", robots: { index: false } };
export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  invalid: "Enter your name, a valid email address, and a password of at least 8 characters.",
  signup: "We couldn't create your account. Check your details or try signing in.",
  not_configured: "Customer sign-up is unavailable until Supabase is configured.",
  setup: "We couldn't start account creation. Please try again.",
};

export default async function CustomerSignup({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  if (!isDemoMode) {
    const {
      data: { user },
    } = await (await createSessionClient()).auth.getUser();
    if (user) redirect("/cart");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold">Create an account</h1>
      <p className="mt-2 text-muted">Sign up to book cameras and manage your bookings.</p>
      {isDemoMode ? (
        <p className="mt-4 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          Supabase isn&apos;t configured yet, so account creation is off. Add your keys to <code>.env.local</code>.
        </p>
      ) : null}
      {error && messages[error] ? (
        <p role="alert" className="mt-4 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          {messages[error]}
        </p>
      ) : null}
      {message === "check_email" ? (
        <p className="mt-4 rounded border border-ok/30 bg-ok-soft px-4 py-3 text-sm text-ok">
          Check your email to confirm your account, then sign in to continue.
        </p>
      ) : null}
      <form action={signUp} className="mt-6 grid gap-4 rounded border border-line bg-surface p-5 sm:p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Full name</label>
          <input id="name" name="name" className="field" autoComplete="name" minLength={2} maxLength={120} required />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" className="field" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="field"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isDemoMode}>Create account</button>
      </form>
      <p className="mt-5 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/account/login" className="font-semibold underline underline-offset-4">Sign in</Link>
      </p>
    </div>
  );
}
