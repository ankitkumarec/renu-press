import type { Metadata } from "next";
import { SupportDeskPageClient } from "@/components/support/SupportDeskPageClient";

export const metadata: Metadata = {
  title: "Digital Support Desk",
  description: "RENU PRESS official support desk — requirements, artwork & lead handover.",
};

export default function SupportPage() {
  return (
    <div className="relative min-h-[70dvh] overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/40 via-[#070d1a] to-[#070d1a]" />
      <div className="container-wide relative py-10 sm:py-14">
        <p className="text-[10px] font-bold tracking-[0.22em] text-violet-300 uppercase sm:text-xs">
          Official channel
        </p>
        <h1 className="font-display mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Digital <span className="grad-text">Support Desk</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          RENU PRESS Support Team — requirements collect karein, artwork upload karein, aur complete case
          admin ERP me handover ho jata hai. Final quotation hamesha team approve karti hai.
        </p>
        <div className="mt-8">
          <SupportDeskPageClient />
        </div>
      </div>
    </div>
  );
}
