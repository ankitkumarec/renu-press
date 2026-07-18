"use client";

import { useEffect, useState } from "react";

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  gst: string | null;
  address: string | null;
  products: string | null;
  totalPurchase: number;
  totalPaid: number;
  due: number;
  ledger: { id: string; type: string; amount: number; method: string; note: string | null; createdAt: string }[];
};

export function SuppliersManager() {
  const [list, setList] = useState<Supplier[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", gst: "", address: "", products: "" });
  const [ledger, setLedger] = useState({ supplierId: "", type: "PURCHASE", amount: 0, method: "CASH", note: "" });
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/erp/suppliers");
    const data = await res.json();
    setList(data.suppliers || []);
  }
  useEffect(() => {
    void load();
  }, []);

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none";

  async function addSupplier(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/erp/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "", gst: "", address: "", products: "" });
    void load();
  }

  async function addLedger(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/erp/suppliers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ledger, amount: Number(ledger.amount) }),
    });
    setLedger({ supplierId: ledger.supplierId, type: "PAYMENT", amount: 0, method: "CASH", note: "" });
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={addSupplier} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
          <h2 className="text-sm font-bold">Add supplier</h2>
          <input className={field} placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={field} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={field} placeholder="GST" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
          <input className={field} placeholder="Products (paper, ink…)" value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })} />
          <input className={field} placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button type="submit" className="w-full rounded-full bg-violet-600 py-2.5 text-sm font-bold">
            Save supplier
          </button>
        </form>

        <form onSubmit={addLedger} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
          <h2 className="text-sm font-bold">Ledger entry (purchase / payment)</h2>
          <select className={field} required value={ledger.supplierId} onChange={(e) => setLedger({ ...ledger, supplierId: e.target.value })}>
            <option value="">Supplier</option>
            {list.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select className={field} value={ledger.type} onChange={(e) => setLedger({ ...ledger, type: e.target.value })}>
            <option value="PURCHASE">Maal aaya (purchase → PO bhi banega)</option>
            <option value="PAYMENT">Payment (paisa diya / due −)</option>
          </select>
          <input className={field} type="number" placeholder="Amount ₹" required value={ledger.amount || ""} onChange={(e) => setLedger({ ...ledger, amount: Number(e.target.value) })} />
          <select className={field} value={ledger.method} onChange={(e) => setLedger({ ...ledger, method: e.target.value })}>
            <option value="CREDIT">Credit / due (maal liya, abhi cash nahi)</option>
            <option value="CASH">Cash paid now</option>
            <option value="ONLINE">Online paid now</option>
            <option value="UPI">UPI paid now</option>
          </select>
          <input className={field} placeholder="Note" value={ledger.note} onChange={(e) => setLedger({ ...ledger, note: e.target.value })} />
          <button type="submit" className="w-full rounded-full border border-white/15 py-2.5 text-sm font-bold">
            Add entry
          </button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <article key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="font-bold">{s.name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {s.phone || "—"} · GST {s.gst || "—"}
            </p>
            {s.products && <p className="mt-1 text-xs text-violet-300">Supplies: {s.products}</p>}
            <p className="mt-2 text-sm text-slate-400 line-clamp-2">{s.address}</p>
            <div className="mt-3 grid grid-cols-3 gap-1 text-[11px]">
              <div className="rounded-lg bg-white/5 p-2">
                <div className="text-slate-500">Purchase</div>
                <div className="font-bold">₹{s.totalPurchase.toLocaleString("en-IN")}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-2">
                <div className="text-slate-500">Paid</div>
                <div className="font-bold text-emerald-400">₹{s.totalPaid.toLocaleString("en-IN")}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-2">
                <div className="text-slate-500">Due</div>
                <div className="font-bold text-rose-300">₹{s.due.toLocaleString("en-IN")}</div>
              </div>
            </div>
            <button
              type="button"
              className="mt-2 text-[11px] font-bold text-cyan-400"
              onClick={() => setOpen(open === s.id ? null : s.id)}
            >
              {open === s.id ? "Hide history" : "History"}
            </button>
            {open === s.id && (
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-[11px] text-slate-400">
                {s.ledger.map((l) => (
                  <li key={l.id} className="flex justify-between border-b border-white/5 py-1">
                    <span>
                      {l.type} · {l.method}
                    </span>
                    <span className={l.type === "PAYMENT" ? "text-emerald-400" : "text-amber-300"}>
                      ₹{l.amount.toLocaleString("en-IN")}
                    </span>
                  </li>
                ))}
                {s.ledger.length === 0 && <li>No entries</li>}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
