"use client";

import { useEffect, useState } from "react";

type Staff = {
  id: string;
  name: string;
  phone: string | null;
  role: string;
  employeeProfile: { department: string | null; designation: string | null; salary: number } | null;
  attendance: { id: string; date: string; status: string }[];
  staffPayments: { id: string; type: string; amount: number; method: string; note: string | null; paidAt: string }[];
};

export function HrManager() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    department: "Production",
    designation: "Staff",
    salary: 0,
  });
  const [pay, setPay] = useState({ type: "ADVANCE", amount: 0, method: "CASH", note: "" });

  async function load() {
    const res = await fetch("/api/erp/hr");
    const data = await res.json();
    setStaff(data.staff || []);
  }
  useEffect(() => {
    void load();
  }, []);

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none";
  const sel = staff.find((s) => s.id === selected);

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/erp/hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "", department: "Production", designation: "Staff", salary: 0 });
    void load();
  }

  async function markAttendance(userId: string, status: string) {
    await fetch("/api/erp/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "attendance", userId, status }),
    });
    void load();
  }

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    await fetch("/api/erp/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "payment", userId: selected, ...pay, amount: Number(pay.amount) }),
    });
    setPay({ type: "ADVANCE", amount: 0, method: "CASH", note: "" });
    void load();
  }

  async function removeStaff(userId: string) {
    if (!confirm("Staff deactivate?")) return;
    await fetch("/api/erp/hr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", userId }),
    });
    setSelected(null);
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs text-slate-500">Staff</div>
          <div className="font-display text-3xl font-black">{staff.length}</div>
        </div>
      </div>

      <form onSubmit={addStaff} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 grid gap-2 sm:grid-cols-5">
        <input className={field} placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={field} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className={field} placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <input className={field} type="number" placeholder="Salary" value={form.salary || ""} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
        <button type="submit" className="rounded-full bg-violet-600 py-2 text-sm font-bold">
          + Staff
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-bold">Team — click for detail</h2>
          <div className="mt-3 space-y-2">
            {staff.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm ${
                  selected === s.id ? "border-violet-500/50 bg-violet-500/10" : "border-white/10"
                }`}
              >
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    {s.employeeProfile?.designation || s.role} · {s.employeeProfile?.department || "—"}
                    {s.phone ? ` · ${s.phone}` : ""}
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  ₹{(s.employeeProfile?.salary || 0).toLocaleString("en-IN")}/mo
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {!sel ? (
            <p className="text-sm text-slate-500">Staff select karo — attendance, advance, salary yahan.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold">{sel.name}</h2>
                  <p className="text-xs text-slate-500">{sel.phone || "No phone"}</p>
                </div>
                <button type="button" className="text-xs font-bold text-rose-400" onClick={() => void removeStaff(sel.id)}>
                  Remove
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Today attendance</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["PRESENT", "ABSENT", "HALF", "LEAVE"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => void markAttendance(sel.id, st)}
                      className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold hover:border-emerald-400/40"
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-[11px] text-slate-400">
                  {sel.attendance.map((a) => (
                    <li key={a.id} className="flex justify-between">
                      <span>{new Date(a.date).toLocaleDateString("en-IN")}</span>
                      <span className="text-emerald-400">{a.status}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={addPayment} className="space-y-2 border-t border-white/10 pt-3">
                <p className="text-xs font-bold text-slate-400">Payment / advance (jaise din me ₹100)</p>
                <div className="grid grid-cols-2 gap-2">
                  <select className={field} value={pay.type} onChange={(e) => setPay({ ...pay, type: e.target.value })}>
                    <option value="ADVANCE">Advance</option>
                    <option value="SALARY">Salary</option>
                    <option value="BONUS">Bonus</option>
                  </select>
                  <select className={field} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                    <option value="CASH">Cash</option>
                    <option value="ONLINE">Online</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <input className={field} type="number" placeholder="Amount" required value={pay.amount || ""} onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })} />
                <input className={field} placeholder="Note" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
                <button type="submit" className="w-full rounded-full bg-emerald-600 py-2 text-sm font-bold">
                  Save payment
                </button>
              </form>

              <ul className="max-h-36 space-y-1 overflow-y-auto text-[11px]">
                {sel.staffPayments.map((p) => (
                  <li key={p.id} className="flex justify-between border-b border-white/5 py-1 text-slate-400">
                    <span>
                      {p.type} · {p.method} · {new Date(p.paidAt).toLocaleDateString("en-IN")}
                      {p.note ? ` · ${p.note}` : ""}
                    </span>
                    <span className="font-bold text-white">₹{p.amount.toLocaleString("en-IN")}</span>
                  </li>
                ))}
                {sel.staffPayments.length === 0 && <li className="text-slate-600">No payments yet</li>}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
