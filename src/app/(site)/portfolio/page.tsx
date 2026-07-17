import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "Work" };

function workImage(category: string, fallback: string) {
  const c = category.toLowerCase();
  if (c.includes("sign") || c.includes("outdoor"))
    return "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1000&q=80";
  if (c.includes("wedding"))
    return "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1000&q=80";
  if (c.includes("id") || c.includes("card"))
    return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1000&q=80";
  if (c.includes("station") || c.includes("corporate"))
    return "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1000&q=80";
  if (c.includes("event"))
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=80";
  if (c.includes("apparel") || c.includes("gift"))
    return "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&q=80";
  return fallback.includes("http") ? fallback : "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=1000&q=80";
}

const GRAD = [
  "from-orange-500 to-rose-600",
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-fuchsia-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-indigo-600",
];

export default async function PortfolioPage() {
  const items = await prisma.portfolioItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="bg-[#070d1a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 py-10 sm:py-14">
        <div className="absolute inset-0 mesh-bg" />
        <div className="blob top-8 right-8 h-40 w-40 bg-orange-500/40" />
        <div className="container-wide relative">
          <p className="text-[10px] font-bold tracking-[0.22em] text-orange-400 uppercase sm:text-xs">
            Portfolio
          </p>
          <h1 className="font-display mt-2 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
            Work from the <span className="grad-text">floor</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
            Signage, stationery, outdoor media and event jobs produced in Saharsa — real print finishes, not stock-only looks.
          </p>
          <Link
            href="/quote"
            className="mt-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white"
          >
            Start your project <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="container-wide py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0c1428] shadow-xl transition hover:-translate-y-1 hover:border-orange-500/30 sm:rounded-3xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={workImage(item.category, item.imageUrl)}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1428] via-transparent to-transparent opacity-90" />
                <span
                  className={`absolute top-3 left-3 rounded-full bg-gradient-to-r ${GRAD[i % GRAD.length]} px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide`}
                >
                  {item.category}
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h2 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
                {item.client ? (
                  <p className="mt-3 text-[11px] font-semibold text-cyan-400/90">Client · {item.client}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        {items.length === 0 ? (
          <p className="py-16 text-center text-slate-500">Portfolio items will appear here.</p>
        ) : null}
      </section>
    </div>
  );
}
