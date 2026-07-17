import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function StaffAttendancePage() {
  const session = await getSession();
  if (!session) return null;
  const rows = await prisma.attendance.findMany({
    where: { userId: session.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Attendance</h1>
      <p className="text-sm text-slate-400">Check-in / out · GPS-ready fields · late / half-day</p>
      {rows.map((r) => (
        <div key={r.id} className="flex justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <span>{new Date(r.date).toLocaleDateString("en-IN")}</span>
          <span className="font-bold text-emerald-400">{r.status}</span>
        </div>
      ))}
      {rows.length === 0 ? <p className="text-slate-500">No records yet.</p> : null}
    </div>
  );
}
