import type { Metadata } from "next";
import { getSettings } from "@/lib/site";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const [settings, process] = await Promise.all([
    getSettings(),
    prisma.processStep.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="border-b border-[var(--color-line)]">
      <section className="container-rp py-16 sm:py-24">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--color-muted)] uppercase">About</p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl text-balance">
          {settings.aboutTitle}
        </h1>
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-base leading-relaxed text-[var(--color-muted)] lg:col-span-7 sm:text-lg">
            <p>{settings.aboutBody}</p>
            <p>{settings.storyBody}</p>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-ink)] p-6 text-[var(--color-paper)]">
              <p className="text-[11px] tracking-[0.16em] text-white/45 uppercase">Studio</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{settings.address}</p>
              <p className="mt-4 text-sm text-white/55">{settings.businessHours}</p>
              <p className="mt-4 text-sm font-medium">{settings.experienceYears}+ years of press work</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="border-t border-[var(--color-line)] bg-[var(--color-paper-2)]/50 py-16">
        <div className="container-rp">
          <h2 className="font-display text-3xl font-semibold tracking-tight">How we work</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {process.map((p, i) => (
              <div key={p.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
                <span className="text-xs text-[var(--color-muted)]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
