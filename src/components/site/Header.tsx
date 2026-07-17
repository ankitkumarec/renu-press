"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Work" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" },
];

export function Header({
  businessName,
  phone,
}: {
  businessName: string;
  phone: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070d1a]/80 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/80 to-transparent" />
      <div className="container-wide flex h-[4.25rem] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl shadow-lg shadow-orange-500/30">
            <span className="absolute inset-0 grad-brand opacity-95" />
            <span className="relative text-sm font-black tracking-tight text-white">RP</span>
          </span>
          <span>
            <span className="block font-display text-base font-bold tracking-tight text-white sm:text-lg">
              {businessName}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-[0.18em] text-orange-300/90 uppercase">
              <Sparkles className="h-3 w-3" /> Saharsa · Bihar
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 md:inline-flex"
          >
            <Phone className="h-3.5 w-3.5 text-cyan-400" />
            {phone}
          </a>
          <Link
            href="/quote"
            className="group relative overflow-hidden rounded-full px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 sm:text-[13px]"
          >
            <span className="absolute inset-0 grad-orange transition group-hover:scale-105" />
            <span className="relative">Get free quote</span>
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-white/10 bg-[#0a1628] lg:hidden", open ? "block" : "hidden")}>
        <div className="container-wide flex flex-col gap-1 py-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/track" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-slate-400">
            Track order
          </Link>
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-slate-400">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
