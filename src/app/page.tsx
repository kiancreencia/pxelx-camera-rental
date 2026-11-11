import Link from "next/link";
import { CameraArt } from "@/components/CameraArt";
import { CameraCard } from "@/components/CameraCard";
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

  return (
    <>
      <section className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-6xl items-center gap-6 px-4 py-6 sm:px-6 md:min-h-[calc(100svh-4rem)] md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:py-16">
        <div className="py-6">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-focus">Your next shot starts here</p>
          <h1 className="max-w-2xl text-5xl font-bold sm:text-6xl lg:text-7xl">
            Cameras for your next trip, vlog or shoot.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted sm:text-xl">
            Find the right camera for the moment. Browse the gear, choose your dates, and book online.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cameras" className="btn btn-primary">
              Browse cameras
            </Link>
            <Link href="/#how-it-works" className="btn btn-quiet">
              How it works
            </Link>
          </div>
        </div>

        {featured[0] ? (
          <Link
            href={`/cameras/${featured[0].slug}`}
            className="group relative mx-auto block w-full max-w-lg"
            aria-label={`Explore ${featured[0].name}`}
          >
            <div className="absolute -inset-3 rotate-3 rounded bg-focus-soft transition-transform group-hover:rotate-1" />
            <div className="relative aspect-[16/9] overflow-hidden rounded border border-line bg-surface shadow-xl sm:aspect-[4/3] md:aspect-[4/5]">
              {featured[0].imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured[0].imageUrl} alt={featured[0].name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <CameraArt seed={featured[0].slug} />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent px-5 pb-5 pt-16 text-white">
                <p className="text-sm text-white/75">Featured gear</p>
                <p className="font-display text-2xl font-bold">{featured[0].name}</p>
                <p className="mt-1 text-sm text-white/80">{featured[0].tagline}</p>
              </div>
            </div>
          </Link>
        ) : null}
      </section>

      {isDemoMode ? (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="rounded border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
            Demo mode: showing sample cameras. Add your Supabase keys in <code>.env.local</code> to load your real
            catalog and take bookings.
          </p>
        </div>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl font-bold">Cameras for rent</h2>
          <Link href="/cameras" className="font-medium underline underline-offset-4 hover:text-focus">
            See all {cameras.length} items
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((camera) => (
            <li key={camera.id} className="contents">
              <CameraCard camera={camera} />
            </li>
          ))}
        </ul>
        <ul className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/cameras?category=${c.slug}`}
                className="inline-block rounded border border-line bg-surface px-3 py-1.5 text-sm font-medium hover:border-ink"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-6 px-4 pt-20 sm:px-6">
        <h2 className="text-3xl font-bold">How renting works</h2>
        <ol className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-ink pt-4">
              <p className="font-display text-sm font-semibold text-focus">Step {i + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-6 gap-8 px-4 pt-20 sm:px-6 md:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="text-3xl font-bold">Questions</h2>
          <p className="mt-3 max-w-xs text-muted">
            Not sure what to rent? Tell us what you&apos;re shooting on{" "}
            <a className="underline underline-offset-4 hover:text-focus" href={site.contact.messenger}>
              Messenger
            </a>{" "}
            and we&apos;ll suggest something.
          </p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-muted transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-2 max-w-prose text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
