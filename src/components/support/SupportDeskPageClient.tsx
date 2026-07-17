"use client";

import { useEffect, useState } from "react";
import { SupportDeskWidget } from "./SupportDesk";

/** Full-page mode: auto-open widget maximized feel via open state */
export function SupportDeskPageClient() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-400">
        Loading support desk…
      </div>
    );
  }
  return (
    <div className="relative min-h-[520px] rounded-2xl border border-white/10 bg-[#0b1220]/80 p-4 sm:p-6">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          ["1. Requirement", "Product, size, qty, timeline"],
          ["2. Artwork", "Images, PDF, design files, voice"],
          ["3. Team quote", "Admin reviews & sends rate"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-sm font-bold text-white">{t}</div>
            <div className="mt-1 text-xs text-slate-400">{d}</div>
          </div>
        ))}
      </div>
      <p className="mb-4 text-sm text-slate-300">
        Neeche official desk hai — WhatsApp alag channel hai. Yeh desk ERP se linked hai; final quote team
        approve karti hai.
      </p>
      <SupportDeskWidget defaultOpen embedded />
    </div>
  );
}
