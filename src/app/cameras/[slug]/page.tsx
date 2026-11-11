import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/BookingPanel";
import { CameraArt } from "@/components/CameraArt";
import { getCamera } from "@/lib/data";
import { isValidDate } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const camera = await getCamera(slug);
  return camera ? { title: camera.name, description: camera.tagline } : { title: "Camera not found" };
}

export default async function CameraPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const camera = await getCamera(slug);
  if (!camera) notFound();

  const start = isValidDate(sp.start) ? sp.start : undefined;
  const end = isValidDate(sp.end) ? sp.end : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link className="hover:text-ink hover:underline" href="/cameras">Cameras</Link>
        <span aria-hidden="true"> / </span>
        <Link className="hover:text-ink hover:underline" href={`/cameras?category=${camera.categorySlug}`}>
          {camera.categoryName}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded border border-line bg-paper">
            {camera.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={camera.imageUrl} alt={camera.name} className="h-full w-full object-cover" />
            ) : (
              <CameraArt seed={camera.slug} />
            )}
          </div>

          <p className="mt-8 text-sm text-muted">{camera.brand}</p>
          <h1 className="text-4xl font-bold">{camera.name}</h1>
          <p className="mt-3 max-w-prose text-lg text-muted">{camera.description}</p>

          {camera.includes.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold">What&apos;s in the box</h2>
              <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {camera.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 bg-focus" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="md:sticky md:top-6 md:self-start">
          <BookingPanel camera={camera} defaultStart={start} defaultEnd={end} />
        </div>
      </div>
    </div>
  );
}
