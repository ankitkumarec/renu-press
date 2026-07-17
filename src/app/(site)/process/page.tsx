import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Process" };

export default async function ProcessPage() {
  const steps = await prisma.processStep.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-rp py-14 sm:py-20">
        <h1 className="font-display max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          From brief to packed job
        </h1>
        <div className="mt-14 space-y-0">
          {steps.map((s, i) => (
            <div key={s.id} className="grid gap-4 border-t border-[var(--color-line)] py-10 md:grid-cols-12">
              <div className="font-display text-5xl font-semibold text-[var(--color-line)] md:col-span-2">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="md:col-span-4">
                <h2 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h2>
              </div>
              <p className="text-[var(--color-muted)] md:col-span-6">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
