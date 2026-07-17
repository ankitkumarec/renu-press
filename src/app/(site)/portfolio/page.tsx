import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const items = await prisma.portfolioItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="border-b border-[var(--color-line)]">
      <section className="container-rp py-14 sm:py-18">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Work from the floor</h1>
        <p className="mt-4 max-w-xl text-[var(--color-muted)]">
          A selection of signage, stationery, events and outdoor jobs produced in Saharsa.
        </p>
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((item) => (
            <article key={item.id} className="mb-5 break-inside-avoid overflow-hidden rounded-[1.25rem] border border-[var(--color-line)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.title} className="w-full object-cover" />
              <div className="p-4">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">{item.category}</p>
                <h2 className="mt-1 font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
