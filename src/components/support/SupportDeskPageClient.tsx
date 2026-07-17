"use client";

import { useEffect, useState } from "react";
import { SupportDeskWidget } from "./SupportDesk";

/** Full-page official Support Team messenger */
export function SupportDeskPageClient() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="flex h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-sm text-slate-400">
        Opening support…
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-3 shadow-2xl shadow-violet-950/30 sm:p-5">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          ["1. Tell us", "What you want to print"],
          ["2. Share files", "Logo · image · PDF · artwork"],
          ["3. Team quote", "Best quotation after review"],
        ].map(([t, d]) => (
          <div
            key={t}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur"
          >
            <div className="text-sm font-bold text-white">{t}</div>
            <div className="mt-1 text-xs text-slate-400">{d}</div>
          </div>
        ))}
      </div>
      <p className="mb-4 text-sm text-slate-300">
        Neeche official <strong className="text-white">RENU PRESS Support Team</strong> messenger hai.
        Final price aur delivery team review ke baad hi share hoti hai.
      </p>
      <SupportDeskWidget defaultOpen embedded />
    </div>
  );
}
