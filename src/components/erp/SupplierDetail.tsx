"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

type Ledger = {
  id: string;
  type: string;
  amount: number;
  method: string;
  note: string | null;
  createdAt: string;
};

type PO = {
  id: string;
  poNumber: string;
  status: string;
  total: number;
  notes: string | null;
  orderedAt: string;
};

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
  ledger: Ledger[];
  purchases: PO[];
};

export function SupplierDetail({ supplierId }: { supplierId: string }) {
  const [s, setS] = useState<Supplier | null>(null);
  const [ledger, setLedger] = useState({
    type: "PURCHASE",
    amount: 0,
    method: "CREDIT",
    note: "",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch(`/api/erp/suppliers?id=${supplierId}`);
    const data = await res.json();
    setS(data.supplier || null);
  }

  useEffect(() => {
    void load();
  }, [supplierId]);

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none";

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/erp/suppliers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId,
        type: ledger.type,
        amount: Number(ledger.amount),
        method: ledger.method,
        note: ledger.note || undefined,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setMsg(data.message || "Fail");
      return;
    }
    setMsg("Entry saved");
    setLedger({ type: "PAYMENT", amount: 0, method: "CASH", note: "" });
    void load();
  }

  if (!s) {
    return (
      <div className="space-y-4">
        <Link href="/erp/suppliers" className="text-xs text-violet-400">
          ← Suppliers
        </Link>
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/erp/suppliers" className="inline-flex items-center gap-1 text-xs font-bold text-violet-400">
        <ArrowLeft className="h-3.5 w-3.5" /> All suppliers
      </Link>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-transparent p-5">
        <h1 className="font-display text-2xl font-black">{s.name}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {s.phone || "—"} · GST {s.gst || "—"}
        </p>
        {s.products && <p className="mt-1 text-xs text-violet-300">Products: {s.products}</p>}
        {s.address && <p className="mt-1 text-sm text-slate-500">{s.address}</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-black/30 p-3">
            <div className="text-[10px] text-slate-500">Total purchase</div>
            <div className="text-xl font-black">₹{s.totalPurchase.toLocaleString("en-IN")}</div>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <div className="text-[10px] text-slate-500">Total paid</div>
            <div className="text-xl font-black text-emerald-400">
              ₹{s.totalPaid.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <div className="text-[10px] text-slate-500">Due</div>
            <div className="text-xl font-black text-rose-300">₹{s.due.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={addEntry} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
          <h2 className="text-sm font-bold">New ledger entry</h2>
          <select className={field} value={ledger.type} onChange={(e) => setLedger({ ...ledger, type: e.target.value })}>
            <option value="PURCHASE">Maal aaya (purchase)</option>
            <option value="PAYMENT">Payment (paisa diya)</option>
          </select>
          <select className={field} value={ledger.method} onChange={(e) => setLedger({ ...ledger, method: e.target.value })}>
            <option value="CREDIT">Credit / due</option>
            <option value="CASH">Cash</option>
            <option value="ONLINE">Online</option>
            <option value="UPI">UPI</option>
          </select>
          <input
            className={field}
            type="number"
            placeholder="Amount ₹"
            required
            value={ledger.amount || ""}
            onChange={(e) => setLedger({ ...ledger, amount: Number(e.target.value) })}
          />
          <input
            className={field}
            placeholder="Note"
            value={ledger.note}
            onChange={(e) => setLedger({ ...ledger, note: e.target.value })}
          />
          <button type="submit" className="w-full rounded-full bg-violet-600 py-2.5 text-sm font-bold">
            Save entry
          </button>
        </form>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-bold mb-3">Purchase orders</h2>
          <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
            {(s.purchases || []).map((p) => (
              <div key={p.id} className="flex justify-between border-b border-white/5 py-2">
                <div>
                  <div className="font-semibold">{p.poNumber}</div>
                  <div className="text-slate-500">
                    {new Date(p.orderedAt).toLocaleString("en-IN")} · {p.status}
                  </div>
                  {p.notes && <div className="text-slate-600">{p.notes}</div>}
                </div>
                <div className="font-bold">₹{p.total.toLocaleString("en-IN")}</div>
              </div>
            ))}
            {(!s.purchases || s.purchases.length === 0) && (
              <p className="text-slate-600 py-4 text-center">No POs yet</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-bold mb-3">Full ledger history (with date)</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Method</th>
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {s.ledger.map((l) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="px-3 py-2 text-xs text-slate-400">
                    {new Date(l.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2 font-semibold">{l.type}</td>
                  <td className="px-3 py-2 text-xs">{l.method}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{l.note || "—"}</td>
                  <td
                    className={`px-3 py-2 text-right font-bold ${
                      l.type === "PAYMENT" ? "text-emerald-400" : "text-amber-300"
                    }`}
                  >
                    ₹{l.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              {s.ledger.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-600">
                    No history
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
