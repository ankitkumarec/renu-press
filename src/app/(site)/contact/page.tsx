import type { Metadata } from "next";
import { getSettings } from "@/lib/site";
import { ContactForm } from "@/components/forms/ContactForm";

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
            <p>
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-[var(--color-ink)] uppercase">Phone</span>
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-[var(--color-ink)]">
                {s.phone}
              </a>
            </p>
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
