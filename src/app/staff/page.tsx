import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function StaffHomePage() {
  const session = await getSession();
  if (!session) return null;

  const [jobs, leaves, attendance] = await Promise.all([
    prisma.productionStage.findMany({
      where: { assigneeId: session.id, status: { not: "DONE" } },
      include: { order: true },
      take: 10,
    }),
    prisma.leaveRequest.count({ where: { userId: session.id, status: "PENDING" } }),
    prisma.attendance.findFirst({
      where: { userId: session.id },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Today&apos;s work</h1>
        <p className="text-sm text-slate-400">Assigned stages · attendance · alerts</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-xs text-amber-200/80">Open jobs</div>
          <div className="text-3xl font-black text-amber-300">{jobs.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-500">Leave pending</div>
          <div className="text-3xl font-black">{leaves}</div>
        </div>
        <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-1">
          <div className="text-xs text-slate-500">Last attendance</div>
          <div className="text-lg font-bold">{attendance?.status || "—"}</div>
        </div>
      </div>
      <section className="space-y-2">
        <h2 className="font-bold">Assigned jobs</h2>
        {jobs.map((j) => (
          <div key={j.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
            <div className="font-bold text-amber-200">{j.order.orderNumber}</div>
            <div className="text-slate-400">
              {j.stage} · {j.order.serviceName}
            </div>
          </div>
        ))}
        {jobs.length === 0 ? <p className="text-slate-500">No active assignments.</p> : null}
      </section>
    </div>
  );
}
