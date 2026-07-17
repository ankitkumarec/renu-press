import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export async function generateStaticParams() {
  const services = await prisma.service.findMany({ select: { slug: true } });
  return services.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!service || !service.isActive) notFound();

  return (
    <article className="border-b border-[var(--color-line)]">
      <div className="container-rp grid gap-10 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--color-muted)] uppercase">
            {service.category.name}
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{service.name}</h1>
          <p className="mt-6 text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">{service.description}</p>
          <ul className="mt-8 space-y-2 text-sm text-[var(--color-ink)]">
            <li>· Colour-managed production in Saharsa</li>
            <li>· Proof approval before bulk run</li>
            <li>· Pickup or local delivery options</li>
          </ul>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="sticky top-24 rounded-[1.5rem] border border-[var(--color-line)] bg-white p-6">
            <p className="text-xs text-[var(--color-muted)]">Start this job</p>
            <p className="font-display mt-2 text-2xl font-semibold tracking-tight">Get an estimate</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href={`/quote?service=${encodeURIComponent(service.name)}`} className="rounded-full bg-[var(--color-ink)] py-3 text-center text-sm font-semibold text-white">
                Quick quote
              </Link>
              <Link href={`/order?service=${encodeURIComponent(service.name)}`} className="rounded-full border border-[var(--color-line)] py-3 text-center text-sm font-semibold">
                Book order
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
