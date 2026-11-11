import type { Metadata } from "next";
import { signIn } from "../actions";
import { isDemoMode } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false } };

const messages: Record<string, string> = {
  credentials: "That email or password isn't right.",
  access: "This account doesn't have staff access.",
};

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold">Staff sign in</h1>
      {isDemoMode ? (
        <p className="mt-4 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          Supabase isn&apos;t configured yet, so sign in is off. Add your keys to <code>.env.local</code>.
        </p>
      ) : null}
      {error && messages[error] ? (
        <p role="alert" className="mt-4 rounded border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          {messages[error]}
        </p>
      ) : null}
      <form action={signIn} className="mt-6 grid gap-4 rounded border border-line bg-surface p-5 sm:p-6">
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
    </div>
  );
}
