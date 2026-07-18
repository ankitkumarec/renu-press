"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  message: string;
  service: string | null;
  source: string;
  status: string;
  createdAt: string;
};

const STATUSES = ["new", "contacted", "quote", "waiting_review", "won", "lost"];

export function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", message: "", service: "" });

  async function load() {
    const res = await fetch("/api/erp/leads");
    const data = await res.json();
    setLeads(data.leads || []);
  }
  useEffect(() => {
    void load();
  }, []);

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none";

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/erp/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "", message: "", service: "" });
    void load();
  }

  async function setStatus(id: string, status: string) {
    await fetch("/api/erp/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    void load();
  }

  async function toOrder(id: string) {
    if (!confirm("Is lead ko order me convert karein?")) return;
    const res = await fetch("/api/erp/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, convertToOrder: true, status: "won" }),
    });
    const data = await res.json();
    if (data.order) alert(`Order: ${data.order.orderNumber}`);
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Delete lead?")) return;
    await fetch(`/api/erp/leads?id=${id}`, { method: "DELETE" });
    void load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-5">
        <input className={field} placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={field} placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className={field} placeholder="Service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
        <input className={field} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <button type="submit" className="rounded-full bg-violet-600 py-2 text-sm font-bold">
          + Lead
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-2">Name / Message</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-white/5">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-slate-500 line-clamp-2">{l.message || l.service}</div>
                </td>
                <td className="px-4 py-2.5">
                  <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                    <Phone className="h-3 w-3" /> {l.phone}
                  </a>
                  <a
                    href={`https://wa.me/91${l.phone.replace(/\D/g, "").slice(-10)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-[10px] text-cyan-400"
                  >
                    WA
                  </a>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{l.source}</td>
                <td className="px-4 py-2.5">
                  <select
                    className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs"
                    value={l.status}
                    onChange={(e) => void setStatus(l.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2.5 space-x-2 text-[11px] font-bold">
                  <button type="button" className="text-violet-300" onClick={() => void toOrder(l.id)}>
                    → Order
                  </button>
                  <button type="button" className="text-rose-400" onClick={() => void remove(l.id)}>
                    Del
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No leads
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
