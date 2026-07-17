"use client";

export function WhatsAppFloat({ whatsapp }: { whatsapp: string }) {
  return (
    <a
      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Namaste RENU PRESS, I need a printing quote.")}`}
      target="_blank"
      rel="noreferrer"
      className="fixed right-4 bottom-4 z-50 flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 text-sm font-bold text-white shadow-2xl shadow-emerald-500/40 transition hover:scale-105 sm:right-6 sm:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-xs font-black">WA</span>
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
