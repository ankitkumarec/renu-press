import { prisma } from "@/lib/db";

export default async function ErpHrPage() {
  const [staff, attendance, leaves, slips] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["EMPLOYEE", "DESIGNER", "MANAGER"] } },
      include: { employeeProfile: true },
    }),
    prisma.attendance.findMany({ orderBy: { date: "desc" }, take: 20, include: { user: true } }),
    prisma.leaveRequest.findMany({ where: { status: "PENDING" }, include: { user: true } }),
    prisma.salarySlip.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">HR · Attendance · Salary</h1>
        <p className="text-sm text-slate-500">Staff, leaves, slips, PF/ESI ready fields</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-slate-500">Staff</div>
          <div className="font-display text-3xl font-black">{staff.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-slate-500">Pending leaves</div>
          <div className="font-display text-3xl font-black text-amber-300">{leaves.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-slate-500">Salary slips</div>
          <div className="font-display text-3xl font-black text-cyan-300">{slips.length}</div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-bold">Team</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-slate-500">
                  {s.employeeProfile?.designation || s.role} · {s.employeeProfile?.department || "—"}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                ₹{(s.employeeProfile?.salary || 0).toLocaleString("en-IN")}/mo
              </div>
            </div>
          ))}
          {staff.length === 0 ? <p className="text-sm text-slate-500">No staff users — seed staff login.</p> : null}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-bold">Recent attendance</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {attendance.map((a) => (
              <li key={a.id} className="flex justify-between border-b border-white/5 py-2">
                <span>
                  {a.user.name} · {new Date(a.date).toLocaleDateString("en-IN")}
                </span>
                <span className="text-xs font-bold text-emerald-400">{a.status}</span>
              </li>
            ))}
            {attendance.length === 0 ? <li className="text-slate-500">No punches yet.</li> : null}
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-bold">Salary slips</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {slips.map((s) => (
              <li key={s.id} className="flex justify-between border-b border-white/5 py-2">
                <span>
                  {s.user.name} · {s.month}/{s.year}
                </span>
                <span className="font-bold">₹{s.netSalary.toLocaleString("en-IN")}</span>
              </li>
            ))}
            {slips.length === 0 ? <li className="text-slate-500">No slips generated.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
