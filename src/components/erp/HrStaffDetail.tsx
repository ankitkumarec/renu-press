"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

type Staff = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  employeeProfile: {
    department: string | null;
    designation: string | null;
    salary: number;
    joinDate: string | null;
  } | null;
  attendance: { id: string; date: string; status: string; notes: string | null }[];
  staffPayments: {
    id: string;
    type: string;
    amount: number;
    method: string;
    note: string | null;
    paidAt: string;
  }[];
};

export function HrStaffDetail({ staffId }: { staffId: string }) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [pay, setPay] = useState({ type: "ADVANCE", amount: 0, method: "CASH", note: "" });
  const [attDate, setAttDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/erp/hr");
    const data = await res.json();
    const s = (data.staff || []).find((x: Staff) => x.id === staffId) || null;
    setStaff(s);
  }

  useEffect(() => {
    void load();
  }, [staffId]);

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none";

  async function markAttendance(status: string) {
    await fetch("/api/erp/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "attendance", userId: staffId, status, date: attDate }),
    });
    setMsg(`Attendance ${status} · ${attDate}`);
    void load();
  }

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/erp/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "payment",
        userId: staffId,
        ...pay,
        amount: Number(pay.amount),
      }),
    });
    setPay({ type: "ADVANCE", amount: 0, method: "CASH", note: "" });
    setMsg("Payment saved");
    void load();
  }

  if (!staff) {
    return (
      <div className="space-y-4">
        <Link href="/erp/hr" className="text-xs text-violet-400">
          ← Back to HR
        </Link>
        <p className="text-slate-500">Loading staff…</p>
      </div>
    );
  }

  const totalAdvance = staff.staffPayments
    .filter((p) => p.type === "ADVANCE")
    .reduce((s, p) => s + p.amount, 0);
  const totalSalaryPaid = staff.staffPayments
    .filter((p) => p.type === "SALARY")
    .reduce((s, p) => s + p.amount, 0);
  const presentDays = staff.attendance.filter((a) => a.status === "PRESENT").length;

  return (
    <div className="space-y-6">
      <Link href="/erp/hr" className="inline-flex items-center gap-1 text-xs font-bold text-violet-400">
        <ArrowLeft className="h-3.5 w-3.5" /> All staff
      </Link>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-transparent p-5">
        <h1 className="font-display text-2xl font-black">{staff.name}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {staff.employeeProfile?.designation || staff.role} ·{" "}
          {staff.employeeProfile?.department || "—"} · {staff.phone || "No phone"}
        </p>
        <p className="text-xs text-slate-500">{staff.email}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-black/30 p-3">
            <div className="text-[10px] text-slate-500">Monthly salary</div>
            <div className="text-xl font-black">
              ₹{(staff.employeeProfile?.salary || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <div className="text-[10px] text-slate-500">Present days (saved)</div>
            <div className="text-xl font-black text-emerald-400">{presentDays}</div>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <div className="text-[10px] text-slate-500">Advances given</div>
            <div className="text-xl font-black text-amber-300">
              ₹{totalAdvance.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <div className="text-[10px] text-slate-500">Salary paid (records)</div>
            <div className="text-xl font-black text-cyan-300">
              ₹{totalSalaryPaid.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <h2 className="text-sm font-bold">Attendance (precise date)</h2>
          <label className="block text-[11px] font-bold text-slate-400">
            Date
            <input className={field} type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            {["PRESENT", "ABSENT", "HALF", "LEAVE"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => void markAttendance(st)}
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold hover:border-emerald-400/50 hover:bg-emerald-500/10"
              >
                {st}
              </button>
            ))}
          </div>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 text-slate-500">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {staff.attendance.map((a) => (
                  <tr key={a.id} className="border-t border-white/5">
                    <td className="px-3 py-2">{new Date(a.date).toLocaleDateString("en-IN")}</td>
                    <td className="px-3 py-2 font-bold text-emerald-400">{a.status}</td>
                    <td className="px-3 py-2 text-slate-500">{a.notes || "—"}</td>
                  </tr>
                ))}
                {staff.attendance.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-600">
                      No attendance yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <h2 className="text-sm font-bold">Payments · advances · salary</h2>
          <form onSubmit={addPayment} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select className={field} value={pay.type} onChange={(e) => setPay({ ...pay, type: e.target.value })}>
                <option value="ADVANCE">Advance (din me ₹100…)</option>
                <option value="SALARY">Salary</option>
                <option value="BONUS">Bonus</option>
              </select>
              <select className={field} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                <option value="CASH">Cash</option>
                <option value="ONLINE">Online</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <input
              className={field}
              type="number"
              placeholder="Amount ₹"
              required
              value={pay.amount || ""}
              onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })}
            />
            <input className={field} placeholder="Note" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
            <button type="submit" className="w-full rounded-full bg-emerald-600 py-2.5 text-sm font-bold">
              Save payment
            </button>
          </form>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 text-slate-500">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2 text-right">₹</th>
                </tr>
              </thead>
              <tbody>
                {staff.staffPayments.map((p) => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="px-3 py-2">{new Date(p.paidAt).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2">{p.type}{p.note ? ` · ${p.note}` : ""}</td>
                    <td className="px-3 py-2">{p.method}</td>
                    <td className="px-3 py-2 text-right font-bold">₹{p.amount.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                {staff.staffPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-600">
                      No payments yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
