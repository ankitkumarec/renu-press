"use client";

export function WhatsAppFloat({ whatsapp }: { whatsapp: string }) {
  return (
    <a
      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Namaste RENU PRESS, I need a printing quote.")}`}
      target="_blank"
      rel="noreferrer"
      className="bottom-safe fixed right-3 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-2xl shadow-emerald-500/40 transition active:scale-95 sm:right-6 sm:h-14 sm:w-auto sm:gap-2 sm:px-5"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
      aria-label="Chat on WhatsApp"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-[10px] font-black sm:h-8 sm:w-8 sm:text-xs">
        WA
      </span>
      <span className="hidden text-sm font-bold sm:inline">Chat with us</span>
    </a>
  );
}
