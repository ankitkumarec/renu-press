import type { Metadata } from "next";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Quick Quote",
  description: "Request a printing estimate from RENU PRESS, Saharsa.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const sp = await searchParams;
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return (
    <div className="mesh-bg border-b border-white/10">
      <div className="container-rp grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <p className="text-xs font-bold tracking-[0.25em] text-orange-400 uppercase">Estimate</p>
          <h1 className="font-display mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Tell us what to <span className="grad-text">print</span>
          </h1>
          <p className="mt-4 leading-relaxed text-slate-400">
            Share product, size and quantity. We respond with material options and a price range during business hours.
          </p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <QuoteForm services={services.map((s) => s.name)} defaultService={sp.service || ""} />
        </div>
      </div>
    </div>
  );
}
