import { prisma } from "@/lib/db";
import { PRODUCTION_STAGES } from "@/lib/roles";

export default async function ErpProductionPage() {
  const stages = await prisma.productionStage.findMany({
    where: { status: { not: "DONE" } },
    include: {
      order: { include: { customer: true } },
      assignee: true,
    },
    orderBy: { sortOrder: "asc" },
    take: 100,
  });

  const byStage = Object.fromEntries(PRODUCTION_STAGES.map((s) => [s, stages.filter((x) => x.stage === s)])) as Record<
    string,
    typeof stages
  >;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Production kanban</h1>
        <p className="text-sm text-slate-500">Design → Approval → Print → Lamination → Cut → Pack → Dispatch → Delivery</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PRODUCTION_STAGES.map((stage) => (
          <div key={stage} className="w-64 shrink-0 rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 px-3 py-2.5 text-xs font-bold tracking-wide text-violet-300">
              {stage} · {byStage[stage]?.length || 0}
            </div>
            <div className="space-y-2 p-2">
              {(byStage[stage] || []).map((job) => (
                <div key={job.id} className="rounded-xl border border-white/10 bg-[#0c1220] p-3 text-xs shadow">
                  <div className="font-bold text-white">{job.order.orderNumber}</div>
                  <div className="mt-0.5 text-slate-400">{job.order.serviceName}</div>
                  <div className="mt-2 text-[10px] text-slate-500">{job.order.customer.name}</div>
                  {job.assignee ? (
                    <div className="mt-1 text-[10px] text-cyan-400">→ {job.assignee.name}</div>
                  ) : (
                    <div className="mt-1 text-[10px] text-slate-600">Unassigned</div>
                  )}
                </div>
              ))}
              {(byStage[stage] || []).length === 0 ? (
                <div className="px-2 py-6 text-center text-[11px] text-slate-600">Empty</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
