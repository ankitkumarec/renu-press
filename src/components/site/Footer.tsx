import Link from "next/link";
import type { SiteSettings } from "@prisma/client";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050a14] text-slate-200">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 -bottom-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="container-wide relative grid gap-8 py-12 sm:gap-10 sm:py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl grad-brand text-sm font-black text-white shadow-lg shadow-purple-500/30 sm:h-12 sm:w-12">
              RP
            </span>
            <div>
              <div className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">{settings.businessName}</div>
              <div className="text-[10px] font-semibold tracking-[0.14em] text-orange-300/90 uppercase sm:text-xs sm:tracking-[0.16em]">
                Saharsa · Bihar
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{settings.tagline}</p>
          <p className="mt-5 text-sm text-slate-400">
            {settings.address}
            <br />
            {settings.city}, {settings.state} {settings.pincode}
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="block font-semibold text-cyan-300 hover:text-cyan-200">
              {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`} className="block text-slate-400 hover:text-white">
              {settings.email}
            </a>
          </div>
          {settings.gst ? <p className="mt-3 text-xs text-slate-500">GST: {settings.gst}</p> : null}
        </div>

        <div className="md:col-span-2">
          <div className="text-[11px] font-bold tracking-[0.2em] text-orange-300/80 uppercase">Explore</div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {[
              ["/services", "Services"],
              ["/portfolio", "Portfolio"],
              ["/gallery", "Gallery"],
              ["/about", "About"],
              ["/careers", "Careers"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="text-[11px] font-bold tracking-[0.2em] text-cyan-300/80 uppercase">Orders</div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {[
              ["/quote", "Quick quote"],
              ["/order", "Book order"],
              ["/track", "Track order"],
              ["/faq", "FAQs"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/15 via-purple-600/10 to-blue-600/15 p-5">
            <div className="text-[11px] font-bold tracking-[0.18em] text-white/70 uppercase">Hours</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{settings.businessHours}</p>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105"
            >
              WhatsApp now
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-wide flex flex-col gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms
            </Link>
            <Link href="/admin" className="hover:text-orange-300">
              Admin
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
