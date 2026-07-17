import { prisma } from "@/lib/db";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-zinc-500">Production queue · status pipeline ready</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-[10px] text-zinc-500 uppercase">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/5">
                <td className="px-4 py-2.5 font-medium">{o.orderNumber}</td>
                <td className="px-4 py-2.5">{o.customer.name}</td>
                <td className="px-4 py-2.5">{o.serviceName}</td>
                <td className="px-4 py-2.5">{o.status}</td>
                <td className="px-4 py-2.5">{o.paymentStatus}</td>
                <td className="px-4 py-2.5">₹{o.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No orders yet. Quotes convert to orders from the production workflow.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
