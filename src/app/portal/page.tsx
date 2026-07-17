import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function PortalHomePage() {
  const session = await getSession();
  if (!session) return null;

  const [orders, quotes, tickets, profile, notifications] = await Promise.all([
    prisma.order.findMany({ where: { customerId: session.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.quote.count({ where: { userId: session.id } }),
    prisma.supportTicket.count({ where: { userId: session.id, status: "open" } }),
    prisma.customerProfile.findUnique({ where: { userId: session.id } }),
    prisma.notification.count({ where: { userId: session.id, read: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Your dashboard</h1>
        <p className="text-sm text-slate-500">Track jobs, invoices, rewards and support</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Orders", String(orders.length), "bg-blue-600"],
          ["Open tickets", String(tickets), "bg-amber-500"],
          ["Wallet", `₹${(profile?.walletBalance || 0).toLocaleString("en-IN")}`, "bg-emerald-600"],
          ["Reward pts", String(profile?.rewardPoints || 0), "bg-violet-600"],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-2 h-1.5 w-10 rounded-full ${c}`} />
            <div className="text-xs text-slate-500">{l}</div>
            <div className="text-xl font-black">{v}</div>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Recent orders</h2>
          <Link href="/portal/orders" className="text-xs font-bold text-blue-600">
            All →
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-semibold">{o.orderNumber}</div>
                <div className="text-xs text-slate-500">{o.serviceName}</div>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">{o.status}</span>
            </li>
          ))}
          {orders.length === 0 ? (
            <li className="py-6 text-center text-sm text-slate-500">
              No orders yet.{" "}
              <Link href="/quote" className="font-bold text-blue-600">
                Request a quote
              </Link>
            </li>
          ) : null}
        </ul>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/track" className="rounded-2xl bg-slate-900 p-4 text-sm font-bold text-white">
          Track order →
        </Link>
        <Link href="/portal/quotes" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold">
          Quotes ({quotes})
        </Link>
        <Link href="/portal/notifications" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold">
          Alerts ({notifications})
        </Link>
      </div>
    </div>
  );
}
