import { prisma } from "@/lib/db";

export default async function AdminTestimonialsPage() {
  const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Testimonials</h1>
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="font-medium">{t.name}</div>
            <div className="text-xs text-zinc-500">
              {[t.role, t.company].filter(Boolean).join(" · ")} · ★{t.rating}
            </div>
            <p className="mt-2 text-sm text-zinc-400">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
