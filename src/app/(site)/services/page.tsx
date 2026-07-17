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

function imgFor(name: string, i: number) {
  const n = name.toLowerCase();
  if (n.includes("offset") || n.includes("digital print"))
    return "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=600&q=80";
  if (n.includes("flex") || n.includes("vinyl") || n.includes("banner") || n.includes("sign") || n.includes("standee") || n.includes("hoarding") || n.includes("glow") || n.includes("led"))
    return "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80";
  if (n.includes("canvas")) return "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80";
  if (n.includes("wedding") || n.includes("invitation"))
    return "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80";
  if (n.includes("visiting") || n.includes("business card"))
    return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80";
  if (n.includes("id") || n.includes("pvc") || n.includes("lanyard") || n.includes("employee") || n.includes("student card"))
    return "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80";
  if (n.includes("t-shirt") || n.includes("polo") || n.includes("hoodie") || n.includes("cap"))
    return "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80";
  if (n.includes("mug") || n.includes("gift") || n.includes("trophy") || n.includes("medal"))
    return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80";
  if (n.includes("laser") || n.includes("cnc") || n.includes("acrylic") || n.includes("3d"))
    return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80";
  if (n.includes("photo")) return "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80";
  const fb = [
    "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=600&q=80",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80",
  ];
  return fb[i % fb.length];
}

export default async function ServicesPage() {
  const categories = await getCategoriesWithServices();

  return (
    <div className="bg-[#070d1a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 py-10 sm:py-12">
        <div className="absolute inset-0 mesh-bg" />
        <div className="blob top-10 right-10 h-40 w-40 bg-orange-500" />
        <div className="container-wide relative">
          <p className="text-xs font-bold tracking-[0.25em] text-orange-400 uppercase">Catalogue</p>
          <h1 className="font-display mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Every line we <span className="grad-text">run on the floor</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-400">
            Premium service cards — matching visuals for every print line.
          </p>
        </div>
      </section>

      {categories.map((cat, cIdx) => (
        <section
          key={cat.id}
          className={cIdx % 2 === 0 ? "border-b border-white/10 bg-[#0a1224]" : "border-b border-white/10 bg-[#0f172a]"}
        >
          <div className="container-wide py-10 sm:py-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
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
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1428] transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgFor(s.name, i)}
                        alt={s.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${grad} opacity-40 mix-blend-multiply`} />
                      <div className="absolute top-3 left-3 grid h-10 w-10 place-items-center rounded-xl bg-black/40 text-white backdrop-blur">
                        <Printer className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="font-display text-lg font-bold tracking-tight">{s.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-400">{s.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
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
