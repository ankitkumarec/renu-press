import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function StaffLeavesPage() {
  const session = await getSession();
  if (!session) return null;
  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Leave requests</h1>
      {leaves.map((l) => (
        <div key={l.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
          <div className="flex justify-between">
            <span className="font-bold">{l.type}</span>
            <span className="text-xs text-amber-400">{l.status}</span>
          </div>
          <div className="mt-1 text-slate-400">
            {new Date(l.fromDate).toLocaleDateString("en-IN")} → {new Date(l.toDate).toLocaleDateString("en-IN")}
          </div>
          <p className="mt-1 text-slate-500">{l.reason}</p>
        </div>
      ))}
      {leaves.length === 0 ? <p className="text-slate-500">No leave history.</p> : null}
    </div>
  );
}
