import { prisma } from "@/lib/db";

export default async function AdminInventoryPage() {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Inventory</h1>
      <p className="text-sm text-zinc-500">Paper, ink, vinyl, flex, frames — stock module ready.</p>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-zinc-500">
          No stock rows yet. Seed inventory from admin tools or Prisma.
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500">
            <tr>
              <th className="py-2">Name</th>
              <th>Qty</th>
              <th>Reorder</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t border-white/5">
                <td className="py-2">{i.name}</td>
                <td>
                  {i.quantity} {i.unit}
                </td>
                <td>{i.reorderLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
