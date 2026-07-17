"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070d1a]/95 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/80 to-transparent" />
      <div className="container-wide flex h-14 items-center justify-between gap-2 sm:h-[4.25rem] sm:gap-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3" onClick={() => setOpen(false)}>
          <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl shadow-lg shadow-orange-500/30 sm:h-11 sm:w-11 sm:rounded-2xl">
            <span className="absolute inset-0 grad-brand opacity-95" />
            <span className="relative text-xs font-black tracking-tight text-white sm:text-sm">RP</span>
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-bold tracking-tight text-white sm:text-base lg:text-lg">
              {businessName}
            </span>
            <span className="flex items-center gap-1 text-[9px] font-semibold tracking-[0.14em] text-orange-300/90 uppercase sm:text-[10px] sm:tracking-[0.18em]">
              <Sparkles className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
              <span className="truncate">Saharsa · Bihar</span>
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-[13px] font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-cyan-400 sm:hidden"
            aria-label="Call"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 md:inline-flex"
          >
            <Phone className="h-3.5 w-3.5 text-cyan-400" />
            {phone}
          </a>
          <Link
            href="/quote"
            className="relative overflow-hidden rounded-full px-3 py-2 text-[11px] font-bold text-white shadow-lg shadow-orange-500/25 sm:px-4 sm:py-2.5 sm:text-[13px]"
          >
            <span className="absolute inset-0 grad-orange" />
            <span className="relative sm:hidden">Quote</span>
            <span className="relative hidden sm:inline">Get free quote</span>
          </Link>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 lg:hidden sm:h-10 sm:w-10"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Full-screen mobile drawer */}
      <div
        className={cn(
          "fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto border-t border-white/10 bg-[#0a1628] lg:hidden sm:top-[4.25rem]",
          open ? "block" : "hidden",
        )}
      >
        <div className="container-wide flex flex-col gap-0.5 py-3 pb-24">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3.5 text-base font-semibold text-slate-100 active:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-white/10" />
          <Link href="/quote" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3.5 text-base font-semibold text-orange-300">
            Get free quote
          </Link>
          <Link href="/track" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3.5 text-base text-slate-300">
            Track order
          </Link>
          <Link href="/login?as=customer" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3.5 text-base text-slate-300">
            Customer login
          </Link>
          <Link href="/login?as=admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3.5 text-base text-violet-300">
            ERP login
          </Link>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="mt-2 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3.5 text-base font-semibold text-cyan-300"
          >
            <Phone className="h-4 w-4" /> {phone}
          </a>
        </div>
      </div>
    </header>
  );
}
