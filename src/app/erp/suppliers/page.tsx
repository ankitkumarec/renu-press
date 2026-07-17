import { prisma } from "@/lib/db";

export default async function ErpSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { purchases: true, items: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Suppliers</h1>
        <p className="text-sm text-slate-500">Ledger · GST · purchase history</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <article key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="font-bold">{s.name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {s.phone || "—"} · GST {s.gst || "—"}
            </p>
            <p className="mt-2 text-sm text-slate-400 line-clamp-2">{s.address}</p>
            <div className="mt-3 flex gap-3 text-[11px] text-slate-500">
              <span>{s._count.purchases} POs</span>
              <span>{s._count.items} stock links</span>
            </div>
          </article>
        ))}
        {suppliers.length === 0 ? <p className="text-slate-500">No suppliers seeded.</p> : null}
      </div>
    </div>
  );
}
