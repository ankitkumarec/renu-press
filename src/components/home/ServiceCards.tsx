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

/** Clear, name-matching print visuals */
function imageForService(name: string, index: number) {
  const n = name.toLowerCase();
  // Offset / digital press machines
  if (n.includes("offset") || n.includes("digital print") || n.includes("digital printing"))
    return "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=800&q=80";
  // Outdoor flex / vinyl / banners / boards
  if (
    n.includes("flex") ||
    n.includes("vinyl") ||
    n.includes("banner") ||
    n.includes("hoarding") ||
    n.includes("standee") ||
    n.includes("glow") ||
    n.includes("led sign") ||
    n.includes("acp") ||
    n.includes("sign board")
  )
    return "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80";
  // Canvas / large format photo
  if (n.includes("canvas"))
    return "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80";
  if (n.includes("photo frame") || n.includes("frame"))
    return "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80";
  if (n.includes("passport") || (n.includes("photo") && !n.includes("print")))
    return "https://images.unsplash.com/photo-1454923634634-bd1614719a7b?w=800&q=80";
  if (n.includes("photo print"))
    return "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80";
  // Wedding / invitation cards
  if (n.includes("wedding") || n.includes("invitation"))
    return "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80";
  // Business / visiting cards stack
  if (n.includes("visiting") || n.includes("business card"))
    return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80";
  if (n.includes("letterhead") || n.includes("bill book") || n.includes("stationery") || n.includes("certificate"))
    return "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80";
  // ID / PVC cards (badges, not resume)
  if (n.includes("id card") || n.includes("pvc") || n.includes("employee card") || n.includes("student card") || n.includes("lanyard"))
    return "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80";
  // Apparel
  if (n.includes("t-shirt") || n.includes("polo") || n.includes("hoodie") || n.includes("cap") || n.includes("shirt"))
    return "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80";
  // Mugs / gifts / trophies
  if (n.includes("mug") || n.includes("bottle") || n.includes("gift") || n.includes("keychain") || n.includes("pen print"))
    return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80";
  if (n.includes("trophy") || n.includes("award") || n.includes("medal"))
    return "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80";
  // Laser / CNC / acrylic / 3d
  if (n.includes("laser") || n.includes("cnc") || n.includes("acrylic") || n.includes("3d"))
    return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80";
  // Packaging / stickers / labels
  if (n.includes("packag") || n.includes("sticker") || n.includes("label") || n.includes("bag"))
    return "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80";
  // Book / brochure / magazine
  if (n.includes("book") || n.includes("brochure") || n.includes("catalogue") || n.includes("magazine") || n.includes("flyer") || n.includes("poster"))
    return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80";
  // Branding / vehicle
  if (n.includes("branding") || n.includes("vehicle") || n.includes("wall graphic") || n.includes("campaign"))
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

  const fallback = [
    "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=800&q=80",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
  ];
  return fallback[index % fallback.length];
}

export function ServiceCards({ services }: { services: Service[] }) {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16 md:py-20">
      <div className="absolute inset-0 section-navy" />
      <div className="blob top-0 right-0 hidden h-72 w-72 bg-purple-600/40 sm:block" />
      <div className="container-wide relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-300 uppercase sm:text-xs sm:tracking-[0.25em]">
              Services
            </p>
            <h2 className="font-display mt-2 max-w-xl text-2xl font-black tracking-tight text-white sm:text-5xl">
              Premium print <span className="grad-text">catalogue</span>
            </h2>
            <p className="mt-2 max-w-lg text-sm text-slate-400 sm:mt-3">
              Production-ready lines with samples, quotes and colour control.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition active:bg-white/10 sm:px-5"
          >
            View all 70+ →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
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
                    <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                      <Link
                        href={`/services/${s.slug}`}
                        className="inline-flex min-h-9 items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold text-white transition active:bg-white/20"
                      >
                        Learn more <ArrowUpRight className="h-3 w-3" />
                      </Link>
                      <Link
                        href={`/quote?service=${encodeURIComponent(s.name)}`}
                        className="inline-flex min-h-9 items-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-orange-500/20"
                      >
                        Get quote
                      </Link>
                      <Link
                        href="/portfolio"
                        className="inline-flex min-h-9 items-center rounded-full border border-white/15 px-3 py-2 text-[11px] font-bold text-slate-300"
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
