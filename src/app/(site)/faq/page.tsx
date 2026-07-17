import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-narrow py-14 sm:py-18">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Questions we hear often</h1>
        <div className="mt-10 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {faqs.map((f) => (
            <details key={f.id} className="group py-5">
              <summary className="cursor-pointer list-none font-semibold tracking-tight marker:content-none">
                {f.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
