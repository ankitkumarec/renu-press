import type { Metadata } from "next";
import { getSettings } from "@/lib/site";
import { ContactForm } from "@/components/forms/ContactForm";
import { WA_CONTACTS, formatInPhone, waChatUrl } from "@/lib/contacts";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-rp grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Visit or message us</h1>
          <div className="mt-8 space-y-5 text-sm text-[var(--color-muted)]">
            <p>
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-[var(--color-ink)] uppercase">Address</span>
              {s.address}
            </p>
            <div>
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-[var(--color-ink)] uppercase">
                WhatsApp chat
              </span>
              <p className="mt-1 text-xs text-slate-500">Number pe click → WhatsApp message open</p>
              <ul className="mt-3 space-y-2">
                {WA_CONTACTS.map((c) => (
                  <li key={c.number}>
                    <a
                      href={waChatUrl(c.number)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/20"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#25D366] text-[10px] font-black text-white">
                        WA
                      </span>
                      {formatInPhone(c.number)}
                      {c.primary ? <span className="text-[10px] font-bold text-emerald-600">MAIN</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p>
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-[var(--color-ink)] uppercase">Email</span>
              <a href={`mailto:${s.email}`} className="text-[var(--color-ink)]">
                {s.email}
              </a>
            </p>
            <p>
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-[var(--color-ink)] uppercase">Hours</span>
              {s.businessHours}
            </p>
            {s.gst ? (
              <p>
                <span className="block text-[11px] font-semibold tracking-[0.14em] text-[var(--color-ink)] uppercase">GST</span>
                {s.gst}
              </p>
            ) : null}
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-line)]">
            <iframe title="Map" src={s.mapsEmbedUrl} className="h-56 w-full" loading="lazy" />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
