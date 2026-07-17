import { prisma } from "@/lib/db";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">FAQs</h1>
      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="rounded-2xl border border-white/10 p-4">
            <div className="font-medium">{f.question}</div>
            <p className="mt-1 text-sm text-zinc-400">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
