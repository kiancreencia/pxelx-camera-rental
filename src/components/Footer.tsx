import Link from "next/link";
import { PixelMark } from "./PixelMark";
import { site } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <PixelMark />
            <span className="font-display text-xl font-bold">{site.name}</span>
          </div>
          <p className="max-w-sm text-sm text-white/70">{site.description}</p>
        </div>
        <div className="space-y-2 text-sm">
          <h2 className="font-display text-base font-semibold">Rent</h2>
          <ul className="space-y-1.5 text-white/70">
            <li><Link className="hover:text-white" href="/cameras">All cameras</Link></li>
            <li><Link className="hover:text-white" href="/#how-it-works">How renting works</Link></li>
            <li><Link className="hover:text-white" href="/#faq">Questions</Link></li>
            <li><Link className="hover:text-white" href="/booking">Find my booking</Link></li>
          </ul>
        </div>
        <div className="space-y-2 text-sm">
          <h2 className="font-display text-base font-semibold">Talk to us</h2>
          <ul className="space-y-1.5 text-white/70">
            <li><a className="hover:text-white" href={site.contact.messenger}>Messenger</a></li>
            <li><a className="hover:text-white" href={site.contact.instagram}>Instagram</a></li>
            <li><a className="hover:text-white" href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>
          </ul>
          <p className="pt-3 text-white/60">We accept {site.payments.join(", ")}.</p>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-white/60 sm:px-6">
          <span>&copy; {new Date().getFullYear()} {site.name}</span>
          <Link className="hover:text-white" href="/admin">Staff sign in</Link>
        </div>
      </div>
    </footer>
  );
}
