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
    <section className="relative min-h-[min(920px,100dvh)] overflow-hidden mesh-bg">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1626785774573-4b7993143486?w=1800&q=80"
          alt="RENU PRESS printing work"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d1a]/75 via-[#070d1a]/88 to-[#070d1a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070d1a] via-transparent to-[#070d1a]/90" />
      </div>

      <div className="blob top-20 left-[15%] h-56 w-56 bg-orange-500" />
      <div className="blob top-40 right-[10%] h-64 w-64 bg-blue-600" style={{ animationDelay: "1.5s" }} />
      <div className="blob bottom-20 left-1/3 h-48 w-48 bg-purple-600" style={{ animationDelay: "3s" }} />

      <div className="container-wide relative z-10 flex min-h-[min(920px,100dvh)] flex-col justify-center py-20 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] text-orange-200 uppercase backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-cyan-300" />
            Premium printing · {city}
          </div>

          <h1 className="font-display mt-6 text-[clamp(2.6rem,7vw,5.2rem)] leading-[0.95] font-black tracking-tight text-white text-balance">
            <span className="grad-text">Print that carries</span>
            <br />
            <span className="text-white">your name with pride.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">{subtitle || title}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/quote"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition hover:scale-[1.03]"
            >
              Get free quote
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              <Play className="h-4 w-4 text-cyan-300" />
              View our work
            </Link>
            <Link href="/services" className="text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline">
              70+ services →
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-6 border-t border-white/10 pt-8">
            {[
              ["Offset + Digital", "Colour-true press"],
              ["Outdoor media", "Flex · vinyl · boards"],
              ["Gifts & apparel", "Mugs · tees · trophies"],
            ].map(([t, d]) => (
              <div key={t}>
                <div className="text-sm font-bold text-white">{t}</div>
                <div className="text-xs text-slate-400">{d}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#070d1a] to-transparent" />
    </section>
  );
}
