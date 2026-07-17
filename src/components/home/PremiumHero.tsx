"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, MapPin, Printer, PanelsTopLeft, Gift } from "lucide-react";

const highlights = [
  {
    title: "Offset + Digital",
    desc: "Colour-true press",
    href: "/services",
    icon: Printer,
    accent: "from-orange-500/25 to-rose-500/10",
    iconColor: "text-orange-300",
    ring: "group-hover:border-orange-400/40",
  },
  {
    title: "Outdoor media",
    desc: "Flex · vinyl · boards",
    href: "/services",
    icon: PanelsTopLeft,
    accent: "from-cyan-500/25 to-blue-500/10",
    iconColor: "text-cyan-300",
    ring: "group-hover:border-cyan-400/40",
  },
  {
    title: "Gifts & apparel",
    desc: "Mugs · tees · trophies",
    href: "/services",
    icon: Gift,
    accent: "from-violet-500/25 to-fuchsia-500/10",
    iconColor: "text-violet-300",
    ring: "group-hover:border-violet-400/40",
  },
];

export function PremiumHero({
  title,
  subtitle,
  city,
}: {
  title: string;
  subtitle: string;
  city: string;
}) {
  return (
    <section className="relative overflow-hidden mesh-bg">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=1200&q=75"
          alt="RENU PRESS printing press"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d1a]/80 via-[#070d1a]/90 to-[#070d1a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070d1a] via-transparent to-[#070d1a]/90" />
      </div>

      <div className="blob top-8 left-[8%] h-28 w-28 bg-orange-500 sm:h-40 sm:w-40" />
      <div className="blob top-12 right-[8%] h-32 w-32 bg-blue-600 sm:h-44 sm:w-44" style={{ animationDelay: "1.5s" }} />

      <div className="container-wide relative z-10 py-8 sm:py-12 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-orange-200 uppercase backdrop-blur sm:gap-2 sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
            <MapPin className="h-3 w-3 shrink-0 text-cyan-300 sm:h-3.5 sm:w-3.5" />
            <span className="truncate">Premium printing · {city}</span>
          </div>

          <h1 className="font-display mt-3 text-[clamp(1.85rem,8vw,4.25rem)] leading-[1.05] font-black tracking-tight text-white text-balance sm:mt-4 sm:leading-[0.98]">
            <span className="grad-text">Print that carries</span>
            <br />
            <span className="text-white">your name with pride.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-[15px] md:text-base">
            {subtitle || title}
          </p>

          <div className="mt-5 flex w-full flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href="/quote"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/30 active:scale-[0.98] sm:w-auto sm:px-6"
            >
              Get free quote
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white backdrop-blur active:bg-white/10 sm:w-auto"
            >
              <Play className="h-4 w-4 text-cyan-300" />
              View our work
            </Link>
            <Link
              href="/services"
              className="py-1 text-center text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline sm:text-left"
            >
              70+ services →
            </Link>
          </div>
        </motion.div>

        {/* Service highlights — glass cards (full width, not cramped text row) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid max-w-4xl grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4"
        >
          {highlights.map(({ title: t, desc, href, icon: Icon, accent, iconColor, ring }) => (
            <Link
              key={t}
              href={href}
              className={`group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-black/20 ${ring}`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-80`} />
              <div className="relative flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/25 shadow-inner">
                  <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-white">
                    <span className="truncate">{t}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/0 transition-all group-hover:translate-x-0.5 group-hover:text-white/70" />
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-slate-300/90 sm:text-[13px]">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
