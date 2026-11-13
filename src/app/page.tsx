import Link from "next/link";
import { CameraCard } from "@/components/CameraCard";
import { FeaturedGearCarousel } from "@/components/FeaturedGearCarousel";
import { site } from "@/lib/config";
import { getCameras, getCategories } from "@/lib/data";
import { isDemoMode } from "@/lib/supabase/public";

// The date picker's earliest day depends on today's date, so render on every request.
export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Choose your gear and dates",
    body: "Search by date to see what's free, then add what you need to your cart.",
  },
  {
    title: "Send your booking",
    body: "Sign in, enter your details, and choose pickup or delivery.",
  },
  {
    title: "We confirm it",
    body: "We check your booking and message you the payment steps to lock your dates.",
  },
  {
    title: "Shoot and return",
    body: `Collect your gear or receive it, then return it on your last day. ${site.rentalDayNote}`,
  },
];

const faqs = [
  {
    q: "How is the price worked out?",
    a: "You pay a daily rate for each calendar day, counting both your pick-up day and your return day. Monday to Wednesday is 3 days.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. Sign in or create an account before sending a booking. You'll get a reference code to check its status.",
  },
  {
    q: "How do I pay?",
    a: `We confirm your booking first, then message you the payment steps. We accept ${site.payments.join(", ")}.`,
  },
  {
    q: "Pickup or delivery?",
    a: `Choose either at checkout. Pickup is at ${site.pickupArea}. For delivery, we quote the courier fee when we confirm your booking.`,
  },
  {
    q: "What should I bring at pickup?",
    a: "A valid government ID, and the refundable deposit shown on the camera's page.",
  },
  {
    q: "What if my plans change?",
    a: "Message us as early as you can and we'll move or cancel your dates if the gear is still free.",
  },
];

export default async function Home() {
  const [cameras, categories] = await Promise.all([getCameras(), getCategories()]);
  const featured = cameras.slice(0, 6);
  const categoryCounts = categories.map((category) => ({
    ...category,
    count: cameras.filter((camera) => camera.categorySlug === category.slug).length,
  }));

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#171717] text-white">
        <div className="pointer-events-none absolute -left-40 -top-32 -z-0 size-[32rem] rounded-full bg-[#c62828]/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-48 right-0 -z-0 size-[28rem] rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[min(680px,calc(100svh-4rem))] max-w-6xl items-center gap-6 px-4 py-6 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:py-6">
          <div className="py-2">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Your next shot starts here
            </p>
            <h1 className="max-w-2xl text-5xl font-bold leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
              Picture Select gears for <span className="text-[#ef4b4b]">great memories.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/65 sm:text-lg">
              Find the right camera for the moment. Browse the gear, choose your dates, and book online.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cameras" className="btn rounded-full bg-[#c62828] px-6 text-white hover:bg-[#a91f1f]">
                Browse cameras <span aria-hidden="true">→</span>
              </Link>
              <Link href="/#how-it-works" className="btn rounded-full border border-white/30 text-white hover:bg-white hover:text-[#171717]">
                How it works
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-4 text-sm">
              <p><span className="font-display text-xl font-bold text-white">{cameras.length}</span> <span className="text-white/55">gear items</span></p>
              <p><span className="font-display text-xl font-bold text-white">{categories.length}</span> <span className="text-white/55">ways to shoot</span></p>
              <p className="text-white/55">Pickup or delivery</p>
            </div>
          </div>

          <FeaturedGearCarousel cameras={cameras} />
        </div>
      </section>

      <section aria-labelledby="browse-category-heading" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c62828]">Find your setup</p>
            <h2 id="browse-category-heading" className="mt-2 text-3xl font-bold sm:text-4xl">What are you shooting?</h2>
          </div>
          <Link href="/cameras" className="mb-1 text-sm font-semibold underline decoration-[#c62828] underline-offset-4 hover:text-[#c62828]">
            Browse all gear <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categoryCounts.map((category, index) => (
            <li key={category.slug}>
              <Link
                href={`/cameras?category=${category.slug}`}
                className={`group flex h-full min-h-32 flex-col justify-between rounded-2xl border p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  index % 3 === 1
                    ? "border-[#171717] bg-[#171717] text-white hover:border-[#c62828]"
                    : index % 3 === 2
                      ? "border-[#c62828] bg-[#c62828] text-white hover:border-[#a91f1f] hover:bg-[#a91f1f]"
                      : "border-[#dedede] bg-white text-[#171717] hover:border-[#c62828]"
                }`}
              >
                <span className="font-display text-lg font-bold leading-tight">{category.name}</span>
                <span className={`mt-4 flex items-center justify-between text-xs ${
                  index % 3 === 0 ? "text-[#777]" : "text-white/65"
                }`}>
                  {category.count} {category.count === 1 ? "item" : "items"}
                  <span className="text-lg text-[#ef4b4b] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {isDemoMode ? (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="rounded border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
            Demo mode: showing sample cameras. Add your Supabase keys in <code>.env.local</code> to load your real
            catalog and take bookings.
          </p>
        </div>
      ) : null}

      <section className="mt-14 bg-[#e5e5e5] py-12 sm:mt-20 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c62828]">A few crowd favorites</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Gear for rent</h2>
          </div>
          <Link href="/cameras" className="font-semibold underline decoration-[#c62828] underline-offset-4 hover:text-[#c62828]">
            See all {cameras.length} items
          </Link>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((camera) => (
            <li key={camera.id} className="contents">
              <CameraCard camera={camera} />
            </li>
          ))}
        </ul>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c62828]">Easy as 1, 2, 3, 4</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">How renting works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] p-5">
                <p className="font-display text-sm font-bold text-[#c62828]">0{i + 1}</p>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-[#171717] py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef4b4b]">Here to help</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Questions?</h2>
            <p className="mt-4 max-w-sm text-white/65">
              Not sure what to rent? Tell us what you&apos;re shooting on{" "}
              <a className="font-semibold text-white underline decoration-[#ef4b4b] underline-offset-4 hover:text-[#ef4b4b]" href={site.contact.messenger}>
                Messenger
              </a>{" "}
              and we&apos;ll suggest something.
            </p>
          </div>
          <div className="divide-y divide-white/15 border-y border-white/15">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-xl leading-none text-white/55 transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-2 max-w-prose text-white/65">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
