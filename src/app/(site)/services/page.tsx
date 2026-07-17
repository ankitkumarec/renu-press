import Link from "next/link";
import type { Metadata } from "next";
import { getCategoriesWithServices } from "@/lib/site";
import { ArrowUpRight, Printer } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "Complete printing and branding catalogue — RENU PRESS, Saharsa, Bihar.",
};

const GRADS = [
  "from-orange-500 to-rose-600",
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-fuchsia-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-indigo-600",
  "from-pink-500 to-purple-600",
  "from-cyan-400 to-blue-700",
];

export default async function ServicesPage() {
  const categories = await getCategoriesWithServices();

  return (
    <div className="bg-[#070d1a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 py-16 sm:py-20">
        <div className="absolute inset-0 mesh-bg" />
        <div className="blob top-10 right-10 h-48 w-48 bg-orange-500" />
        <div className="container-wide relative">
          <p className="text-xs font-bold tracking-[0.25em] text-orange-400 uppercase">Catalogue</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Every line we <span className="grad-text">run on the floor</span>
          </h1>
          <p className="mt-4 max-w-xl text-slate-400">
            Premium service cards — quote, samples and production notes for shops, schools, campaigns and brands.
          </p>
        </div>
      </section>

      {categories.map((cat, cIdx) => (
        <section
          key={cat.id}
          className={cIdx % 2 === 0 ? "border-b border-white/10 bg-[#0a1224]" : "border-b border-white/10 bg-[#0f172a]"}
        >
          <div className="container-wide py-12 sm:py-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-black sm:text-3xl">{cat.name}</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-300">
                {cat.services.length} services
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.services.map((s, i) => {
                const grad = GRADS[i % GRADS.length];
                return (
                  <article
                    key={s.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1428] p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10"
                  >
                    <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow-lg`}>
                      <Printer className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold tracking-tight">{s.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">{s.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={`/services/${s.slug}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold hover:bg-white/15"
                      >
                        Learn more <ArrowUpRight className="h-3 w-3" />
                      </Link>
                      <Link
                        href={`/quote?service=${encodeURIComponent(s.name)}`}
                        className={`rounded-full bg-gradient-to-r ${grad} px-3 py-1.5 text-[11px] font-bold text-white`}
                      >
                        Get quote
                      </Link>
                      <Link href="/portfolio" className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-slate-300">
                        Samples
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
