import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Careers" };

export default async function CareersPage() {
  const jobs = await prisma.careerJob.findMany({ where: { isOpen: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-rp py-14">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Careers at RENU PRESS</h1>
        <p className="mt-4 max-w-xl text-[var(--color-muted)]">Join the production floor in Saharsa.</p>
        <div className="mt-10 space-y-4">
          {jobs.map((j) => (
            <article key={j.id} className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
              <h2 className="font-semibold text-lg">{j.title}</h2>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {j.department} · {j.location} · {j.type}
              </p>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{j.description}</p>
            </article>
          ))}
          {jobs.length === 0 ? <p className="text-sm text-[var(--color-muted)]">No open roles right now. Check back later.</p> : null}
        </div>
      </div>
    </div>
  );
}
