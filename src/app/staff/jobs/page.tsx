import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function StaffJobsPage() {
  const session = await getSession();
  if (!session) return null;
  const jobs = await prisma.productionStage.findMany({
    where: { assigneeId: session.id },
    include: { order: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">My jobs</h1>
      {jobs.map((j) => (
        <div key={j.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex justify-between gap-2">
            <div className="font-bold">{j.order.orderNumber}</div>
            <span className="text-xs font-bold text-amber-400">{j.status}</span>
          </div>
          <div className="mt-1 text-sm text-slate-400">
            {j.stage} · {j.order.serviceName}
          </div>
        </div>
      ))}
      {jobs.length === 0 ? <p className="text-slate-500">Nothing assigned.</p> : null}
    </div>
  );
}
