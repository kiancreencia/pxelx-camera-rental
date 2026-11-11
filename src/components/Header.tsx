import Link from "next/link";
import { CartLink } from "./CartLink";
import { PixelMark } from "./PixelMark";
import { site } from "@/lib/config";
import { signOut } from "@/app/account/actions";
import { isDemoMode } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";

export async function Header() {
  const {
    data: { user },
  } = isDemoMode ? { data: { user: null } } : await (await createSessionClient()).auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
          <PixelMark />
          <span className="font-display text-xl font-bold tracking-tight">{site.shortName}</span>
          <span className="hidden text-sm text-muted sm:inline">camera rental</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-[0.95rem]">
          <Link href="/cameras" className="rounded px-3 py-2 font-medium hover:bg-ink hover:text-white">
            Cameras
          </Link>
          <Link href="/#how-it-works" className="hidden rounded px-3 py-2 font-medium hover:bg-ink hover:text-white sm:block">
            How it works
          </Link>
          <Link href="/booking" className="rounded px-3 py-2 font-medium hover:bg-ink hover:text-white">
            Find my booking
          </Link>
          <CartLink />
          {user ? (
            <form action={signOut}>
              <button type="submit" className="rounded px-3 py-2 font-medium hover:bg-ink hover:text-white">
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/account/login?next=/cart"
              className="rounded bg-ink px-3 py-2 font-semibold text-white hover:bg-focus"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
