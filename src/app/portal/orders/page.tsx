import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PortalOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  const orders = await prisma.order.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    include: { stages: { orderBy: { sortOrder: "asc" } }, invoice: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Orders & timeline</h1>
      {orders.map((o) => (
        <article key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-bold">{o.orderNumber}</div>
              <div className="text-sm text-slate-500">{o.serviceName}</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-bold">₹{o.total.toLocaleString("en-IN")}</div>
              <div className="text-xs text-slate-500">{o.paymentStatus}</div>
            </div>
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto">
            {(o.stages.length
              ? o.stages
              : [{ id: "s", stage: o.status, status: "ACTIVE" } as { id: string; stage: string; status: string }]
            ).map((s) => (
              <span
                key={s.id}
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                  s.status === "DONE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.stage}
              </span>
            ))}
          </div>
        </article>
      ))}
      {orders.length === 0 ? <p className="text-slate-500">No orders yet.</p> : null}
    </div>
  );
}
