"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Star,
  Factory,
  Users,
  Building2,
  Quote,
  ChevronRight,
  Calculator,
} from "lucide-react";

export function MarqueeClients() {
  const brands = [
    "Retail Shops",
    "Schools",
    "Colleges",
    "Campaigns",
    "Weddings",
    "Startups",
    "Clinics",
    "Events",
    "Offices",
    "Hotels",
  ];
  const row = [...brands, ...brands];
  return (
    <section className="relative border-y border-white/10 bg-[#050a14] py-8 overflow-hidden">
      <p className="mb-4 text-center text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase">Trusted clients & industries</p>
      <div className="marquee-track gap-4 px-4">
        {row.map((b, i) => (
          <span
            key={b + i}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] px-5 py-2.5 text-sm font-bold text-slate-200"
          >
            <Building2 className="h-4 w-4 text-orange-400" />
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

export function WhyChooseGrid({
  items,
}: {
  items: { id: string; title: string; body: string }[];
}) {
  const colors = [
    "from-orange-500/20 to-rose-500/10 border-orange-400/30",
    "from-blue-500/20 to-cyan-500/10 border-cyan-400/30",
    "from-violet-500/20 to-fuchsia-500/10 border-fuchsia-400/30",
    "from-emerald-500/20 to-teal-500/10 border-emerald-400/30",
  ];
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#7c2d12]" />
      <div className="container-wide relative">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.25em] text-amber-300 uppercase">Why choose us</p>
          <h2 className="font-display mt-2 text-3xl font-black text-white sm:text-5xl">
            Built for Bihar businesses that <span className="grad-text">care about finish</span>
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((w, i) => (
            <motion.div
              key={w.id}
              whileHover={{ y: -6 }}
              className={`rounded-3xl border bg-gradient-to-br p-6 sm:p-8 ${colors[i % colors.length]}`}
            >
              <CheckCircle2 className="h-7 w-7 text-white" />
              <h3 className="font-display mt-4 text-xl font-bold text-white">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{w.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessShowcase({
  steps,
}: {
  steps: { id: string; title: string; body: string }[];
}) {
  const ring = ["#f97316", "#2563eb", "#a855f7", "#06b6d4"];
  return (
    <section className="section-light py-16 sm:py-20">
      <div className="container-wide">
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-orange-600 uppercase">Printing process</p>
          <h2 className="font-display mt-2 text-3xl font-black text-slate-900 sm:text-5xl">How your job moves</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200"
            >
              <div
                className="mb-4 grid h-14 w-14 place-items-center rounded-2xl text-xl font-black text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${ring[i % ring.length]}, #0f172a)` }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MachineGallery() {
  const machines = [
    {
      title: "Digital production",
      img: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=900&q=80",
      tag: "Colour press",
    },
    {
      title: "Outdoor media bay",
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
      tag: "Flex · vinyl",
    },
    {
      title: "Finishing & packing",
      img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80",
      tag: "QC desk",
    },
    {
      title: "Design & proof",
      img: "https://images.unsplash.com/photo-1626785774573-4b7993143486?w=900&q=80",
      tag: "Artwork",
    },
  ];
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0 bg-[#070d1a]" />
      <div className="blob left-0 top-20 h-64 w-64 bg-cyan-500/30" />
      <div className="container-wide relative">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-cyan-300 uppercase">Production facility</p>
            <h2 className="font-display mt-2 text-3xl font-black text-white sm:text-5xl">
              Machine gallery
            </h2>
          </div>
          <Factory className="h-10 w-10 text-orange-400" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {machines.map((m, i) => (
            <motion.figure
              key={m.title}
              whileHover={{ y: -8 }}
              className={`group overflow-hidden rounded-3xl border border-white/10 ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
            >
              <div className={`relative ${i === 0 ? "aspect-[16/11]" : "aspect-[4/3]"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <figcaption className="absolute right-4 bottom-4 left-4">
                  <span className="rounded-full bg-orange-500/90 px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                    {m.tag}
                  </span>
                  <div className="mt-2 font-display text-lg font-bold text-white sm:text-xl">{m.title}</div>
                </figcaption>
              </div>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Force print-relevant images by category (overrides odd stock from CMS if needed) */
function portfolioImage(category: string, fallback: string) {
  const c = category.toLowerCase();
  if (c.includes("sign") || c.includes("outdoor"))
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80";
  if (c.includes("wedding"))
    return "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80";
  if (c.includes("id") || c.includes("card"))
    return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80";
  if (c.includes("station") || c.includes("corporate"))
    return "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=900&q=80";
  if (c.includes("event"))
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80";
  if (c.includes("apparel") || c.includes("gift"))
    return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&q=80";
  return fallback.includes("unsplash") ? fallback : "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=900&q=80";
}

export function PortfolioBurst({
  items,
}: {
  items: { id: string; title: string; category: string; description: string; imageUrl: string }[];
}) {
  return (
    <section className="section-light py-16 sm:py-20">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-blue-600 uppercase">Latest projects</p>
            <h2 className="font-display mt-2 text-3xl font-black text-slate-900 sm:text-5xl">Recent work</h2>
          </div>
          <Link href="/portfolio" className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
            All projects <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((p, i) => (
            <motion.article
              key={p.id}
              whileHover={{ y: -8 }}
              className={`overflow-hidden rounded-[1.6rem] bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 ${i === 1 ? "md:-mt-6" : ""}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portfolioImage(p.category, p.imageUrl)}
                  alt={p.title}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span className="rounded-full bg-gradient-to-r from-orange-500 to-purple-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                  {p.category}
                </span>
                <h3 className="font-display mt-3 text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustriesRibbon({
  industries,
}: {
  industries: { id: string; name: string; body: string }[];
}) {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-violet-700 to-orange-600" />
      <div className="container-wide relative">
        <h2 className="font-display text-center text-3xl font-black text-white sm:text-4xl">Industries we serve</h2>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <div key={ind.id} className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition hover:bg-white/15">
              <h3 className="font-bold text-white">{ind.name}</h3>
              <p className="mt-2 text-sm text-white/75">{ind.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsLuxury({
  items,
}: {
  items: { id: string; name: string; role: string | null; company: string | null; body: string; rating: number }[];
}) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0 bg-[#0a1628]" />
      <div className="blob right-10 top-10 h-56 w-56 bg-orange-500/30" />
      <div className="container-wide relative">
        <div className="flex items-center gap-3">
          <Quote className="h-8 w-8 text-orange-400" />
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-orange-300 uppercase">Google-style reviews</p>
            <h2 className="font-display text-3xl font-black text-white sm:text-4xl">Loved in Saharsa</h2>
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] p-6 shadow-xl">
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-200">&ldquo;{t.body}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-purple-600 text-xs font-black text-white">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-xs text-slate-400">{[t.role, t.company].filter(Boolean).join(" · ")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamAwardsStrip() {
  const leaders = [
    {
      name: "Nitish Kumar",
      nameHi: "नितीश कुमार",
      role: "Founder",
      roleHi: "संस्थापक",
      bio: "RENU PRESS ke founder — vision, quality standards aur Saharsa me customer trust ke peeche ki leadership.",
      gradient: "from-orange-500 to-rose-600",
    },
    {
      name: "Operations Head",
      nameHi: "Operations Head",
      role: "Management · All operations",
      roleHi: "प्रबंधन · समस्त संचालन",
      bio: "Daily production, delivery timelines, staff coordination aur har order ko shop floor se customer tak sambhalte hain.",
      gradient: "from-blue-500 to-violet-600",
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] to-[#111827]" />
      <div className="blob left-10 top-10 h-48 w-48 bg-orange-500/25" />
      <div className="container-wide relative">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.25em] text-orange-400 uppercase">Leadership</p>
          <h2 className="font-display mt-2 text-3xl font-black text-white sm:text-5xl">
            Founder & <span className="grad-text">management</span>
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Jo log RENU PRESS ko chalata hai — vision se lekar daily operations tak.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {leaders.map((p) => (
            <article
              key={p.name}
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl transition hover:-translate-y-1 sm:p-8"
            >
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${p.gradient} opacity-30 blur-2xl`} />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                <div
                  className={`grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${p.gradient} text-2xl font-black text-white shadow-lg`}
                >
                  {p.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.18em] text-cyan-300 uppercase">{p.role}</p>
                  <h3 className="font-display mt-1 text-2xl font-black text-white">{p.name}</h3>
                  <p className="mt-0.5 text-sm font-semibold text-orange-200/90">
                    {p.nameHi} · {p.roleHi}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.bio}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white">
            <Users className="h-7 w-7 text-cyan-300" />
            <h3 className="font-display mt-3 text-xl font-bold">Production team</h3>
            <p className="mt-2 text-sm text-slate-400">
              Designers, machine operators, finishing & front office — ek floor pe, Saharsa me.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Design desk", "Press operators", "Outdoor crew", "Front office"].map((r) => (
                <span key={r} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-orange-600 via-rose-600 to-purple-800 p-6 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-lg font-black">★</div>
            <h3 className="font-display mt-3 text-xl font-bold">Recognition</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li>· Preferred vendor for local schools & retail</li>
              <li>· High-volume campaign print partner</li>
              <li>· Wedding & event finish quality</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuoteCalculatorCta() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0 bg-[#050a14]" />
      <div className="blob left-1/4 top-0 h-72 w-72 bg-orange-500/40" />
      <div className="blob right-1/4 bottom-0 h-72 w-72 bg-blue-600/40" />
      <div className="container-wide relative">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#12203a] via-[#1e1b4b] to-[#7c2d12] p-8 shadow-2xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-orange-200">
                <Calculator className="h-3.5 w-3.5" /> Quote calculator
              </div>
              <h2 className="font-display mt-4 text-3xl font-black text-white sm:text-5xl">
                Size × material × qty = clear estimate
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                Tell us product, size and deadline. We reply with material options and a firm range — WhatsApp or form.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/quote" className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30">
                  Open quote form
                </Link>
                <Link href="/order" className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white">
                  Book order
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Flex banner", "₹ / sq.ft"],
                ["Visiting cards", "from ₹299"],
                ["ID cards", "bulk rates"],
                ["LED boards", "custom"],
              ].map(([a, b]) => (
                <div key={a} className="rounded-2xl border border-white/15 bg-black/20 p-4 backdrop-blur">
                  <div className="text-sm font-bold text-white">{a}</div>
                  <div className="mt-1 text-xs text-cyan-300">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InstagramStrip() {
  const shots = [
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
    "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80",
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=80",
  ];
  return (
    <section className="bg-[#070d1a] py-14">
      <div className="container-wide">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
            Instagram <span className="grad-text">feed</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">@renupress</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
          {shots.map((src, i) => (
            <a key={i} href="/gallery" className="group aspect-square overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
