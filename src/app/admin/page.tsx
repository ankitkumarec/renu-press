import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [leads, quotes, orders, services, customers] = await Promise.all([
    prisma.lead.count(),
    prisma.quote.count({ where: { status: "requested" } }),
    prisma.order.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const cards = [
    { label: "Open leads", value: leads, href: "/admin/leads" },
    { label: "Quote requests", value: quotes, href: "/admin/leads" },
    { label: "Orders", value: orders, href: "/admin/orders" },
    { label: "Active services", value: services, href: "/admin/services" },
    { label: "Customers", value: customers, href: "/admin/users" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">RENU PRESS operations overview</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
          >
            <div className="text-[11px] text-zinc-500">{c.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold tabular-nums">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold">Recent leads</h2>
          <ul className="mt-4 divide-y divide-white/5">
            {recentLeads.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-zinc-500">
                    {l.phone} · {l.service || l.source}
                  </div>
                </div>
                <span className="text-[10px] tracking-wide text-zinc-500 uppercase">{l.status}</span>
              </li>
            ))}
            {recentLeads.length === 0 ? <li className="py-4 text-sm text-zinc-500">No leads yet.</li> : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            {[
              ["/admin/settings", "Edit website contact & hero"],
              ["/admin/services", "Manage service catalogue"],
              ["/admin/leads", "Review quotes & CRM leads"],
              ["/admin/orders", "Production queue"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5">
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
