"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Trash2 } from "lucide-react";

type Item = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  warehouse: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  supplier?: { name: string } | null;
};

export function InventoryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Paper",
    quantity: 0,
    reorderLevel: 5,
    unitCost: 0,
    unit: "pcs",
  });
  const [adjustId, setAdjustId] = useState("");
  const [delta, setDelta] = useState(0);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/erp/inventory");
    const data = await res.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/erp/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.ok) {
      setMsg(data.message || "Fail");
      return;
    }
    setMsg("Item added");
    setForm({ name: "", sku: "", category: "Paper", quantity: 0, reorderLevel: 5, unitCost: 0, unit: "pcs" });
    void load();
  }

  async function adjust(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustId || !delta) return;
    const res = await fetch("/api/erp/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: adjustId,
        delta,
        reason: delta > 0 ? "New stock in" : "Stock out / use",
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setMsg(data.message || "Fail");
      return;
    }
    setMsg(`Stock updated: ${delta > 0 ? "+" : ""}${delta}`);
    setDelta(0);
    void load();
  }

  async function deleteItem(id: string, name: string) {
    if (!confirm(`Delete item "${name}"?`)) return;
    const res = await fetch(`/api/erp/inventory?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) {
      setMsg(data.message || "Delete fail");
      return;
    }
    setMsg(`Deleted: ${name}`);
    void load();
  }

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40";
  const low = items.filter((i) => i.quantity <= i.reorderLevel);

  return (
    <div className="space-y-6">
      {low.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          ⚠ {low.length} item(s) low / reorder level pe
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={addItem} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Plus className="h-4 w-4 text-cyan-400" /> Add item
          </h2>
          <input className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-2">
            <input className={field} placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <input className={field} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input className={field} type="number" placeholder="Qty" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <input className={field} type="number" placeholder="Reorder" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} />
            <input className={field} type="number" placeholder="Cost ₹" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
          </div>
          <button type="submit" className="w-full rounded-full bg-cyan-600 py-2.5 text-sm font-bold">
            Save item
          </button>
        </form>

        <form onSubmit={adjust} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
          <h2 className="text-sm font-bold">Stock update (new stock / use)</h2>
          <select className={field} value={adjustId} onChange={(e) => setAdjustId(e.target.value)} required>
            <option value="">Select item</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.quantity} {i.unit})
              </option>
            ))}
          </select>
          <input
            className={field}
            type="number"
            placeholder="+10 new stock / -2 used"
            value={delta || ""}
            onChange={(e) => setDelta(Number(e.target.value))}
            required
          />
          <p className="text-[11px] text-slate-500">Positive = stock aaya · Negative = use/khatm</p>
          <button type="submit" className="w-full rounded-full border border-white/15 py-2.5 text-sm font-bold">
            Update qty
          </button>
        </form>
      </div>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((i) => {
          const isLow = i.quantity <= i.reorderLevel;
          return (
            <article
              key={i.id}
              className={`rounded-2xl border p-4 ${
                isLow ? "border-rose-500/40 bg-rose-500/5" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <Package className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                  {i.category}
                </span>
              </div>
              <h3 className="mt-3 font-bold">{i.name}</h3>
              <p className="text-xs text-slate-500">
                SKU {i.sku || "—"} · {i.warehouse}
              </p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="font-display text-2xl font-black tabular-nums">
                    {i.quantity}
                    <span className="ml-1 text-xs font-semibold text-slate-500">{i.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Reorder @ {i.reorderLevel}</div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  ₹{i.unitCost.toLocaleString("en-IN")}
                  <div className="text-[10px]">{i.supplier?.name || "—"}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void deleteItem(i.id, i.name)}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete item
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
