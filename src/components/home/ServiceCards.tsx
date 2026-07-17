"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Printer,
  Image as ImageIcon,
  IdCard,
  Shirt,
  Gift,
  PanelTop,
  FileText,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category?: { name: string } | null;
};

const ICONS = [Printer, ImageIcon, IdCard, Shirt, Gift, PanelTop, FileText, Sparkles];
const GRADS = [
  "from-orange-500/90 to-rose-600/90",
  "from-blue-500/90 to-cyan-500/90",
  "from-violet-500/90 to-fuchsia-600/90",
  "from-emerald-500/90 to-teal-600/90",
  "from-amber-500/90 to-orange-600/90",
  "from-sky-500/90 to-indigo-600/90",
  "from-pink-500/90 to-purple-600/90",
  "from-cyan-400/90 to-blue-700/90",
];

function imageForService(name: string, index: number) {
  const n = name.toLowerCase();
  if (n.includes("offset") || n.includes("digital"))
    return "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80";
  if (n.includes("flex") || n.includes("vinyl") || n.includes("banner") || n.includes("hoarding") || n.includes("sign"))
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";
  if (n.includes("canvas") || n.includes("photo") || n.includes("frame"))
    return "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80";
  if (n.includes("wedding") || n.includes("invitation"))
    return "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80";
  if (n.includes("visiting") || n.includes("business card") || n.includes("letterhead") || n.includes("bill"))
    return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80";
  if (n.includes("id") || n.includes("pvc") || n.includes("lanyard"))
    return "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80";
  if (n.includes("t-shirt") || n.includes("polo") || n.includes("hoodie") || n.includes("cap"))
    return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80";
  if (n.includes("mug") || n.includes("gift") || n.includes("trophy") || n.includes("medal"))
    return "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80";
  if (n.includes("packag") || n.includes("sticker") || n.includes("label"))
    return "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80";
  const fallback = [
    "https://images.unsplash.com/photo-1626785774573-4b7993143486?w=800&q=80",
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
  ];
  return fallback[index % fallback.length];
}

export function ServiceCards({ services }: { services: Service[] }) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-22">
      <div className="absolute inset-0 section-navy" />
      <div className="blob top-0 right-0 h-72 w-72 bg-purple-600/40" />
      <div className="container-wide relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-cyan-300 uppercase">Services</p>
            <h2 className="font-display mt-2 max-w-xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Premium print <span className="grad-text">catalogue</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-slate-400">
              Not a plain list — every line is production-ready with samples, quotes and colour control.
            </p>
          </div>
          <Link
            href="/services"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            View all 70+ →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            const grad = GRADS[i % GRADS.length];
            const img = imageForService(s.name, i);
            return (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 4) * 0.06, duration: 0.45 }}
                className="group relative"
              >
                <div className="absolute -inset-[1px] rounded-[1.4rem] bg-gradient-to-br from-orange-400 via-purple-500 to-cyan-400 opacity-50 transition group-hover:opacity-100" />
                <div className="relative h-full overflow-hidden rounded-[1.35rem] bg-[#0b1324]">
                  <div className="relative aspect-[5/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={s.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${grad} opacity-70 mix-blend-multiply`} />
                    <div className="absolute top-3 left-3 grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-black/30 text-white shadow-lg backdrop-blur">
                      <Icon className="h-5 w-5 drop-shadow" />
                    </div>
                    <div className="absolute right-3 bottom-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white/90 uppercase backdrop-blur">
                      {s.category?.name || "Print"}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-display text-lg font-bold tracking-tight text-white">{s.name}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{s.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/services/${s.slug}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/20"
                      >
                        Learn more <ArrowUpRight className="h-3 w-3" />
                      </Link>
                      <Link
                        href={`/quote?service=${encodeURIComponent(s.name)}`}
                        className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-orange-500/20"
                      >
                        Get quote
                      </Link>
                      <Link
                        href="/portfolio"
                        className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white"
                      >
                        Samples
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
