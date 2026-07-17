import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { waChatUrl, PRIMARY_WHATSAPP } from "@/lib/contacts";

export const metadata: Metadata = { title: "Careers" };

export default async function CareersPage() {
  const jobs = await prisma.careerJob.findMany({
    where: { isOpen: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1428] via-[#070d1a] to-[#070d1a]" />
      <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="container-wide relative py-12 sm:py-16 md:py-20">
        <p className="text-[10px] font-bold tracking-[0.22em] text-orange-400 uppercase sm:text-xs">Join the team</p>
        <h1 className="font-display mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Careers at <span className="grad-text">RENU PRESS</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Join the production floor in Saharsa — offset, digital, outdoor media, and more.
        </p>

        <div className="mt-10 space-y-4">
          {jobs.map((j, i) => (
            <article
              key={j.id}
              className="group relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-5 shadow-xl backdrop-blur-sm transition hover:border-orange-400/30 hover:from-white/[0.1] sm:p-6"
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-40 blur-2xl ${
                  i % 3 === 0
                    ? "bg-orange-500/30"
                    : i % 3 === 1
                      ? "bg-cyan-500/25"
                      : "bg-violet-500/25"
                }`}
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/25">
                      <Briefcase className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-bold text-white sm:text-xl">{j.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                        {j.department ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                            <Briefcase className="h-3 w-3 text-orange-300" />
                            {j.department}
                          </span>
                        ) : null}
                        {j.location ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                            <MapPin className="h-3 w-3 text-cyan-300" />
                            {j.location}
                          </span>
                        ) : null}
                        {j.type ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                            <Clock className="h-3 w-3 text-violet-300" />
                            {j.type}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{j.description}</p>
                </div>

                <a
                  href={waChatUrl(
                    PRIMARY_WHATSAPP,
                    `Namaste RENU PRESS, main "${j.title}" job ke liye apply karna chahta/chahti hoon.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  Apply on WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
              <p className="text-sm text-slate-300">No open roles right now. Check back later.</p>
              <Link
                href="/contact"
                className="mt-4 inline-flex text-sm font-semibold text-orange-300 hover:text-orange-200"
              >
                Contact us →
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
