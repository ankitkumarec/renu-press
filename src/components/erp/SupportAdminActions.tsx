"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LEAD_STATUSES } from "@/lib/support/constants";

export function SupportAdminActions({
  conversationId,
  status,
  quotePrice,
  quoteDelivery,
  quoteRemarks,
}: {
  conversationId: string;
  status: string;
  quotePrice: number | null;
  quoteDelivery: string | null;
  quoteRemarks: string | null;
}) {
  const router = useRouter();
  const [st, setSt] = useState(status);
  const [price, setPrice] = useState(quotePrice?.toString() || "");
  const [delivery, setDelivery] = useState(quoteDelivery || "");
  const [remarks, setRemarks] = useState(quoteRemarks || "");
  const [adminMessage, setAdminMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function save(extra?: { sendQuote?: boolean }) {
    setBusy(true);
    setMsg("");
    try {
      const body: Record<string, unknown> = {
        conversationId,
        status: st,
        adminMessage: adminMessage || undefined,
      };
      if (extra?.sendQuote && price) {
        body.quotePrice = Number(price);
        body.quoteDelivery = delivery;
        body.quoteRemarks = remarks;
      }
      const res = await fetch("/api/erp/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Saved.");
        setAdminMessage("");
        router.refresh();
      } else setMsg(data.message || "Failed");
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0c1220] p-5">
      <h2 className="text-sm font-bold text-white">Admin actions</h2>

      <label className="block text-xs text-slate-400">
        Lead status
        <select
          value={st}
          onChange={(e) => setSt(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-400">
        Message to customer (appears in chat)
        <textarea
          value={adminMessage}
          onChange={(e) => setAdminMessage(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="Optional note after review…"
        />
      </label>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
        <div className="text-xs font-bold tracking-wider text-violet-300 uppercase">Approve quotation</div>
        <p className="mt-1 text-[11px] text-slate-400">
          Customer chat me price / delivery tabhi jati hai jab aap yahan submit karein.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-slate-400">
            Price (₹)
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-slate-400">
            Delivery date
            <input
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="e.g. 22 Jul 2026"
            />
          </label>
        </div>
        <label className="mt-3 block text-xs text-slate-400">
          Remarks
          <input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15 disabled:opacity-50"
        >
          Update status
        </button>
        <button
          type="button"
          disabled={busy || !price}
          onClick={() => void save({ sendQuote: true })}
          className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          Send approved quote to chat
        </button>
      </div>
      {msg ? <p className="text-xs text-emerald-300">{msg}</p> : null}
    </section>
  );
}
