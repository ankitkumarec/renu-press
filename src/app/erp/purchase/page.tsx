import { prisma } from "@/lib/db";

export default async function ErpPurchasePage() {
  const pos = await prisma.purchaseOrder.findMany({
    orderBy: { orderedAt: "desc" },
    include: { supplier: true },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Purchase orders</h1>
        <p className="text-sm text-slate-500">PO · receive goods · supplier bills</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">PO #</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {pos.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="px-4 py-3 font-semibold">{p.poNumber}</td>
                <td className="px-4 py-3">{p.supplier.name}</td>
                <td className="px-4 py-3 text-xs">{p.status}</td>
                <td className="px-4 py-3 text-right font-bold">₹{p.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {pos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No purchase orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
