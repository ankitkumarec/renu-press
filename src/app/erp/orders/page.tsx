import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ErpOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, stages: { orderBy: { sortOrder: "asc" } } },
    take: 40,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">Orders</h1>
          <p className="text-sm text-slate-500">Production pipeline attached to each job</p>
        </div>
        <Link href="/erp/production" className="text-xs font-bold text-violet-400">
          Kanban production →
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                <td className="px-4 py-3">{o.customer.name}</td>
                <td className="px-4 py-3 text-slate-400">{o.serviceName}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{o.paymentStatus}</td>
                <td className="px-4 py-3 text-right font-bold">₹{o.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No orders — create from quote conversion or portal.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
