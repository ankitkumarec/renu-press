import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  Wallet,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

export default async function ErpDashboardPage() {
  const [orders, leads, expenses, lowStock, inventory, customers, quotes] = await Promise.all([
    prisma.order.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.expense.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.inventoryItem.count({
      where: {
        // SQLite: quantity <= reorderLevel — filter in JS if needed
      },
    }),
    prisma.inventoryItem.findMany({ take: 200 }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.quote.count({ where: { status: "requested" } }),
  ]);

  const low = inventory.filter((i) => i.quantity <= i.reorderLevel);
  const expenseTotal = expenses._sum.amount || 0;

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: true },
  });
  const recentExpenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const kpis = [
    { label: "Orders", value: String(orders), icon: ShoppingCart, tone: "from-blue-500 to-cyan-400", href: "/erp/orders" },
    { label: "Open leads", value: String(leads), icon: Users, tone: "from-violet-500 to-fuchsia-500", href: "/erp/crm" },
    { label: "Quotes", value: String(quotes), icon: TrendingUp, tone: "from-orange-500 to-rose-500", href: "/erp/leads" },
    { label: "Expenses", value: `₹${expenseTotal.toLocaleString("en-IN")}`, icon: Wallet, tone: "from-amber-500 to-orange-600", href: "/erp/expenses" },
    { label: "Customers", value: String(customers), icon: Users, tone: "from-emerald-500 to-teal-500", href: "/erp/crm" },
    { label: "Low stock", value: String(low.length), icon: AlertTriangle, tone: "from-rose-500 to-red-600", href: "/erp/inventory" },
  ];

  // Fake sparkline heights for visual charts
  const spark = [40, 55, 48, 70, 62, 80, 75, 90, 85, 95, 88, 100];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-violet-400 uppercase">Command center</p>
          <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">ERP Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">RENU PRESS · real-time operations snapshot</p>
        </div>
        <Link
          href="/erp/expenses"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25"
        >
          + New expense <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className={`mb-3 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${k.tone} text-white shadow-lg`}>
              <k.icon className="h-4 w-4" />
            </div>
            <div className="text-[11px] text-slate-500">{k.label}</div>
            <div className="mt-1 font-display text-xl font-black tabular-nums sm:text-2xl">{k.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Revenue pulse</h2>
            <span className="text-[10px] text-slate-500">Last 12 weeks</span>
          </div>
          <div className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2">
            {spark.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-violet-700 to-fuchsia-400 opacity-80 transition hover:opacity-100" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl bg-white/5 py-2">
              <div className="text-slate-500">Sales</div>
              <div className="font-bold text-emerald-400">▲ 12%</div>
            </div>
            <div className="rounded-xl bg-white/5 py-2">
              <div className="text-slate-500">Jobs</div>
              <div className="font-bold text-cyan-300">{orders}</div>
            </div>
            <div className="rounded-xl bg-white/5 py-2">
              <div className="text-slate-500">Burn</div>
              <div className="font-bold text-orange-300">₹{(expenseTotal / 1000).toFixed(1)}k</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
          <h2 className="text-sm font-bold">Low stock alerts</h2>
          <ul className="mt-4 space-y-2">
            {low.slice(0, 6).map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm">
                <span className="font-medium">{i.name}</span>
                <span className="text-xs text-rose-300">
                  {i.quantity} {i.unit}
                </span>
              </li>
            ))}
            {low.length === 0 ? <li className="text-sm text-slate-500">Stock healthy.</li> : null}
          </ul>
          <Link href="/erp/inventory" className="mt-4 inline-block text-xs font-bold text-violet-400">
            Inventory →
          </Link>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Recent orders</h2>
            <Link href="/erp/orders" className="text-xs text-violet-400">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-white/5">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                <div>
                  <div className="font-semibold">{o.orderNumber}</div>
                  <div className="text-xs text-slate-500">
                    {o.customer.name} · {o.serviceName}
                  </div>
                </div>
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300">{o.status}</span>
              </li>
            ))}
            {recentOrders.length === 0 ? <li className="py-4 text-sm text-slate-500">No orders yet.</li> : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Latest expenses</h2>
            <Link href="/erp/expenses" className="text-xs text-violet-400">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-white/5">
            {recentExpenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                <div>
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-xs text-slate-500">
                    {e.category} · {e.paymentMethod}
                    {e.proofUrl ? " · 📎 proof" : ""}
                  </div>
                </div>
                <span className="font-bold tabular-nums text-orange-300">₹{e.amount.toLocaleString("en-IN")}</span>
              </li>
            ))}
            {recentExpenses.length === 0 ? <li className="py-4 text-sm text-slate-500">No expenses yet.</li> : null}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["/erp/production", "Kanban production"],
          ["/erp/expenses", "Smart expenses + OCR"],
          ["/erp/hr", "Attendance & salary"],
          ["/erp/reports", "P&L reports"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent px-3 py-3 text-center text-xs font-bold text-slate-300 hover:border-violet-500/40">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
