import { prisma } from "@/lib/db";

export default async function AdminPortfolioPage() {
  const items = await prisma.portfolioItem.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Portfolio</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <article key={i.id} className="overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i.imageUrl} alt="" className="aspect-video w-full object-cover" />
            <div className="p-3 text-sm">
              <div className="font-medium">{i.title}</div>
              <div className="text-xs text-zinc-500">{i.category}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
