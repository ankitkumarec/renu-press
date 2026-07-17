import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function StaffSalaryPage() {
  const session = await getSession();
  if (!session) return null;
  const slips = await prisma.salarySlip.findMany({
    where: { userId: session.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Salary slips</h1>
      {slips.map((s) => (
        <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex justify-between">
            <div className="font-bold">
              {s.month}/{s.year}
            </div>
            <div className="font-black text-amber-300">₹{s.netSalary.toLocaleString("en-IN")}</div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
            <span>Basic {s.basic}</span>
            <span>OT {s.overtime}</span>
            <span>PF {s.pf}</span>
          </div>
          <div className="mt-1 text-xs font-bold text-slate-500">{s.status}</div>
        </div>
      ))}
      {slips.length === 0 ? <p className="text-slate-500">No slips yet.</p> : null}
    </div>
  );
}
