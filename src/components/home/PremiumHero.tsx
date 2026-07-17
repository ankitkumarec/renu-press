"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, MapPin } from "lucide-react";

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

          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:mt-8 sm:grid-cols-3 sm:gap-5 sm:pt-6">
            {[
              ["Offset + Digital", "Colour-true press"],
              ["Outdoor media", "Flex · vinyl · boards"],
              ["Gifts & apparel", "Mugs · tees · trophies"],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                <div className="text-sm font-bold text-white">{t}</div>
                <div className="text-xs text-slate-400">{d}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
