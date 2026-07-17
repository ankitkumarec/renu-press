import { prisma } from "@/lib/db";
import { PRODUCTION_STAGES } from "@/lib/roles";

export default async function StaffQueuePage() {
  const open = await prisma.productionStage.findMany({
    where: { status: { in: ["PENDING", "ACTIVE"] } },
    include: { order: true, assignee: true },
    take: 40,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Production queue</h1>
      <p className="text-sm text-slate-400">Stages: {PRODUCTION_STAGES.join(" → ")}</p>
      {open.map((j) => (
        <div key={j.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          <div className="font-bold">{j.order.orderNumber}</div>
          <div className="text-slate-400">
            {j.stage} · {j.assignee?.name || "Unassigned"}
          </div>
        </div>
      ))}
      {open.length === 0 ? <p className="text-slate-500">Queue clear.</p> : null}
    </div>
  );
}
