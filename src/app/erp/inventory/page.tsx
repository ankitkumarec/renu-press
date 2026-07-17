import { prisma } from "@/lib/db";
import { Package } from "lucide-react";

export default async function ErpInventoryPage() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    include: { supplier: true },
  });
  const low = items.filter((i) => i.quantity <= i.reorderLevel);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">Warehouse</p>
        <h1 className="font-display text-2xl font-black">Inventory ERP</h1>
        <p className="mt-1 text-sm text-slate-500">Paper · vinyl · ink · flex · frames · gifts · machine parts</p>
      </div>

      {low.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          ⚠ {low.length} item(s) at or below reorder level
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((i) => {
          const isLow = i.quantity <= i.reorderLevel;
          return (
            <article
              key={i.id}
              className={`rounded-2xl border p-4 ${
                isLow ? "border-rose-500/40 bg-rose-500/5" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <Package className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                  {i.category}
                </span>
              </div>
              <h3 className="mt-3 font-bold">{i.name}</h3>
              <p className="text-xs text-slate-500">
                SKU {i.sku || "—"} · {i.warehouse}
              </p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="font-display text-2xl font-black tabular-nums">
                    {i.quantity}
                    <span className="ml-1 text-xs font-semibold text-slate-500">{i.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Reorder @ {i.reorderLevel}</div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  ₹{i.unitCost.toLocaleString("en-IN")}
                  <div className="text-[10px]">{i.supplier?.name || "No supplier"}</div>
                </div>
              </div>
            </article>
          );
        })}
        {items.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/15 py-12 text-center text-slate-500">
            No stock rows — run seed / add inventory.
          </div>
        ) : null}
      </div>
    </div>
  );
}
