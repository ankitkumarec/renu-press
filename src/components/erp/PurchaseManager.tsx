"use client";

import { useEffect, useState } from "react";

type PO = {
  id: string;
  poNumber: string;
  status: string;
  total: number;
  notes: string | null;
  orderedAt: string;
  supplier: { name: string; phone: string | null };
};

type Supplier = { id: string; name: string };

export function PurchaseManager() {
  const [pos, setPos] = useState<PO[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    supplierId: "",
    total: 0,
    notes: "",
    method: "CREDIT",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const [p, s] = await Promise.all([
      fetch("/api/erp/purchase").then((r) => r.json()),
      fetch("/api/erp/suppliers").then((r) => r.json()),
    ]);
    setPos(p.pos || []);
    setSuppliers((s.suppliers || []).map((x: Supplier) => ({ id: x.id, name: x.name })));
  }

  useEffect(() => {
    void load();
  }, []);

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none";

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/erp/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, total: Number(form.total) }),
    });
    const data = await res.json();
    if (!data.ok) {
      setMsg(data.message || "Fail");
      return;
    }
    setMsg(`PO created: ${data.po.poNumber}`);
    setForm({ supplierId: form.supplierId, total: 0, notes: "", method: "CREDIT" });
    void load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <select className={field} required value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
          <option value="">Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input className={field} type="number" placeholder="Amount ₹" required value={form.total || ""} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
        <select className={field} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
          <option value="CREDIT">Credit (maal liya, baad me pay)</option>
          <option value="CASH">Cash paid now</option>
          <option value="ONLINE">Online paid now</option>
          <option value="UPI">UPI paid now</option>
        </select>
        <input className={field} placeholder="Items note (paper, ink…)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" className="rounded-full bg-violet-600 py-2.5 text-sm font-bold">
          + Purchase / maal aaya
        </button>
      </form>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      <p className="text-xs text-slate-500">
        Credit = due supplier pe badhega · Cash/Online/UPI = abhi payment bhi ledger me.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">PO #</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {pos.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="px-4 py-3 font-semibold">{p.poNumber}
                  <div className="text-[10px] text-slate-500">{new Date(p.orderedAt).toLocaleString("en-IN")}</div>
                </td>
                <td className="px-4 py-3">
                  {p.supplier.name}
                  {p.supplier.phone && <div className="text-[10px] text-slate-500">{p.supplier.phone}</div>}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{p.notes || "—"}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-bold ${
                    p.status.includes("UNPAID") ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold">₹{p.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {pos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Abhi koi purchase nahi — upar se maal aaya entry karo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
