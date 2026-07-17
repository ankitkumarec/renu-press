/** Laptop mockup with RENU PRESS on the screen */
export function LaptopBrand() {
  return (
    <div className="relative mx-auto w-full max-w-[min(100%,28rem)] sm:max-w-lg">
      <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-400 opacity-40 blur-xl sm:-inset-6 sm:opacity-50 sm:blur-2xl" />

      {/* Laptop body */}
      <div className="relative">
        {/* Screen bezel */}
        <div className="rounded-t-2xl border border-white/20 bg-[#1a1d24] p-2 shadow-2xl sm:p-2.5">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#0a1628]">
            {/* Screen content — RENU PRESS website mock */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#9a3412]">
              <div className="flex h-full flex-col items-center justify-center p-4 text-center sm:p-6">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 text-sm font-black text-white shadow-lg shadow-orange-500/40 sm:h-16 sm:w-16 sm:text-base">
                  RP
                </div>
                <div className="mt-3 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
                  RENU PRESS
                </div>
                <div className="mt-1 text-[10px] font-bold tracking-[0.2em] text-orange-300 uppercase sm:text-[11px]">
                  Saharsa · Bihar
                </div>
                <p className="mt-3 max-w-[220px] text-[11px] leading-relaxed text-slate-300 sm:text-xs">
                  Printing & Branding Solutions
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {["Offset", "Digital", "Flex", "Signage", "Gifts"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-cyan-200 sm:text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-1.5 text-[10px] font-bold text-white sm:text-[11px]">
                  Get free quote
                </div>
              </div>
            </div>
            {/* Camera dot */}
            <div className="absolute top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/20" />
          </div>
        </div>
        {/* Laptop base */}
        <div className="relative mx-auto">
          <div className="h-2 rounded-b-lg bg-gradient-to-b from-[#2a2f3a] to-[#151820] sm:h-2.5" />
          <div className="mx-auto h-1 w-[108%] -translate-x-[4%] rounded-b-xl bg-[#0d1016] shadow-lg" />
        </div>
      </div>
    </div>
  );
}
