"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { WA_CONTACTS, waChatUrl, formatInPhone, PRIMARY_WHATSAPP } from "@/lib/contacts";

export function WhatsAppFloat({ whatsapp }: { whatsapp?: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Prefer DB setting if set, else primary from contacts
  const fallback = whatsapp?.replace(/\D/g, "") || PRIMARY_WHATSAPP;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="bottom-safe fixed right-3 z-50 flex flex-col items-end gap-2 sm:right-6"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
    >
      {open ? (
        <div className="w-[min(100vw-1.5rem,18rem)] overflow-hidden rounded-2xl border border-white/15 bg-[#0b1528]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#25D366]/15 px-3 py-2.5">
            <div>
              <div className="text-xs font-bold text-white">WhatsApp chat</div>
              <div className="text-[10px] text-slate-400">Number choose karein</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="p-2">
            {WA_CONTACTS.map((c) => (
              <li key={c.number}>
                <a
                  href={waChatUrl(c.number)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-white/8 active:bg-white/12"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-md shadow-emerald-500/30">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                      {c.label}
                      {c.primary ? (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-emerald-300 uppercase">
                          Main
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-xs text-slate-400">{formatInPhone(c.number)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {/* Direct fallback single link for accessibility */}
          <a
            href={waChatUrl(fallback.length >= 10 ? fallback : PRIMARY_WHATSAPP)}
            target="_blank"
            rel="noreferrer"
            className="block border-t border-white/10 px-3 py-2 text-center text-[11px] font-semibold text-emerald-300/90 hover:text-emerald-200"
          >
            Quick chat (main)
          </a>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-2xl shadow-emerald-500/40 transition active:scale-95 sm:h-14 sm:w-auto sm:gap-2 sm:px-5"
        aria-label="Chat on WhatsApp"
        aria-expanded={open}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-[10px] font-black sm:h-8 sm:w-8 sm:text-xs">
          WA
        </span>
        <span className="hidden text-sm font-bold sm:inline">{open ? "Close" : "Chat with us"}</span>
      </button>
    </div>
  );
}
