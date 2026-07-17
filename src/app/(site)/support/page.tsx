import type { Metadata } from "next";
import { SupportDeskPageClient } from "@/components/support/SupportDeskPageClient";
import { BadgeCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "RENU PRESS Support Team",
  description:
    "Official RENU PRESS Support Team — printing & branding requirements, artwork review, and quotation handoff.",
};

export default function SupportPage() {
  return (
    <div className="relative min-h-[70dvh] overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/50 via-[#070d1a] to-[#070d1a]" />
      <div className="pointer-events-none absolute top-20 left-1/4 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-10 bottom-20 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="container-wide relative py-10 sm:py-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Online now · Usually replies within 5 minutes
        </div>
        <h1 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          ❤️ RENU PRESS{" "}
          <span className="grad-text">Support Team</span>
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-cyan-300/90">
          <BadgeCheck className="h-4 w-4" />
          Verified Business · Official support channel
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Printing aur branding requirements ke liye hum yahin hain. Images, logo, PDF, artwork bhejein —
          complete details collect karke team aapko best quotation share karegi.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-slate-400">
          {["📷 Images", "🎨 Logo", "📄 PDF", "💳 Cards", "📦 Packaging", "🏢 Shop photo"].map((t) => (
            <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <SupportDeskPageClient />
        </div>
      </div>
    </div>
  );
}
