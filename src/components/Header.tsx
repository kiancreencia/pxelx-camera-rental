import Link from "next/link";
import { CartLink } from "./CartLink";
import { PixelMark } from "./PixelMark";
import { site } from "@/lib/config";
import { signOut as signOutCustomer } from "@/app/account/actions";
import { signOut as signOutStaff } from "@/app/admin/actions";
import { isDemoMode } from "@/lib/supabase/public";
import { createSessionClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = isDemoMode ? null : await createSessionClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  let isStaff = false;
  if (user && supabase) {
    const { data: profile, error } = await supabase.from("profiles").select("is_admin").maybeSingle();
    if (error) throw new Error(error.message);
    isStaff = profile?.is_admin ?? false;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#d0d0d0] bg-[#e5e5e5] text-[#171717]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-[#171717]" aria-label={`${site.name} home`}>
          <PixelMark />
          <span className="font-display text-xl font-bold tracking-tight">{site.shortName}</span>
          <span className="hidden text-sm text-[#666] sm:inline">camera rental</span>
        </Link>
        <nav aria-label="Main" className="flex w-full flex-wrap items-center justify-end gap-1 text-[0.95rem] sm:w-auto">
          {isStaff ? (
            <>
              <Link href="/admin" className="shrink-0 rounded-full px-3 py-2 font-medium hover:bg-black/5">
                Bookings
              </Link>
              <Link href="/" className="shrink-0 rounded-full px-3 py-2 font-medium hover:bg-black/5">
                Storefront
              </Link>
              <form action={signOutStaff} className="shrink-0">
                <button type="submit" className="whitespace-nowrap rounded-full px-3 py-2 font-medium hover:bg-black/5">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/cameras" className="shrink-0 rounded-full px-3 py-2 font-medium hover:bg-black/5">
                Cameras
              </Link>
              <Link href="/#how-it-works" className="hidden shrink-0 rounded-full px-3 py-2 font-medium hover:bg-black/5 sm:block">
                How it works
              </Link>
              <Link href="/booking" className="shrink-0 rounded-full px-3 py-2 font-medium hover:bg-black/5">
                Find my booking
              </Link>
              <CartLink />
              {user ? (
                <form action={signOutCustomer} className="shrink-0">
                  <button type="submit" className="whitespace-nowrap rounded-full px-3 py-2 font-medium hover:bg-black/5">
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/account/login?next=/cart"
                  className="rounded-full bg-[#c62828] px-4 py-2 font-semibold text-white hover:bg-[#a91f1f]"
                >
                  Sign in
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
