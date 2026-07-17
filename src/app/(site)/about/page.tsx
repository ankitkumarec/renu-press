import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/site";
import { prisma } from "@/lib/db";
import { MapPin, Clock, Award, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "About" };

const STEP_GRAD = [
  "from-orange-500 to-rose-600",
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-fuchsia-600",
  "from-emerald-500 to-teal-600",
];

export default async function AboutPage() {
  const [settings, process] = await Promise.all([
    getSettings(),
    prisma.processStep.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="bg-[#070d1a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 py-12 sm:py-20">
        <div className="absolute inset-0 mesh-bg" />
        <div className="blob top-10 right-10 h-48 w-48 bg-orange-500/30" />
        <div className="container-wide relative">
          <p className="text-[10px] font-bold tracking-[0.22em] text-orange-400 uppercase sm:text-xs">About</p>
          <h1 className="font-display mt-3 max-w-3xl text-3xl font-black tracking-tight text-balance sm:text-6xl">
            {settings.aboutTitle}
          </h1>
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="space-y-5 text-sm leading-relaxed text-slate-300 sm:text-base lg:col-span-7">
              <p>{settings.aboutBody}</p>
              <p className="text-slate-400">{settings.storyBody}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white"
                >
                  Get a quote <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white"
                >
                  See our work
                </Link>
              </div>
            </div>
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 shadow-xl backdrop-blur">
                <p className="text-[11px] font-bold tracking-[0.16em] text-cyan-300 uppercase">Studio</p>
                <p className="mt-3 flex gap-2 text-sm leading-relaxed text-slate-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                  {settings.address}
                </p>
                <p className="mt-4 flex gap-2 text-sm text-slate-400">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  {settings.businessHours}
                </p>
                <p className="mt-4 flex gap-2 text-sm font-semibold text-white">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  {settings.experienceYears}+ years of press work
                </p>
                <div className="mt-5 border-t border-white/10 pt-4 text-sm">
                  <div className="font-bold text-white">Leadership</div>
                  <p className="mt-1 text-slate-400">Founder: Nitish Kumar (नितीश कुमार)</p>
                  <p className="text-slate-400">Operations: Om Kumar (ओम कुमार)</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* How we work — dark-friendly premium cards */}
      <section className="relative overflow-hidden border-t border-white/10 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1224] to-[#070d1a]" />
        <div className="container-wide relative">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold tracking-[0.22em] text-cyan-400 uppercase sm:text-xs">Process</p>
            <h2 className="font-display mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              How we <span className="grad-text">work</span>
            </h2>
            <p className="mt-2 text-sm text-slate-400">Clear steps from brief to delivery — no guesswork.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <div
                key={p.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1428] p-5 shadow-xl sm:p-6"
              >
                <div
                  className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-lg ${STEP_GRAD[i % STEP_GRAD.length]}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.body}</p>
                <div
                  className={`pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-20 blur-xl ${STEP_GRAD[i % STEP_GRAD.length]}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
