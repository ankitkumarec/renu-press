"use client";

import { useState, type FormEvent } from "react";

export function QuoteForm({
  services,
  defaultService = "",
}: {
  services: string[];
  defaultService?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setStatus("ok");
      setMessage(data.message || "Quote received. We will contact you shortly.");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400/60";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] p-6 shadow-2xl shadow-orange-500/10 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold text-slate-400">
          Name
          <input name="name" required className={field} placeholder="Your name" />
        </label>
        <label className="text-xs font-bold text-slate-400">
          Phone
          <input name="phone" required className={field} placeholder="10-digit mobile" />
        </label>
        <label className="text-xs font-bold text-slate-400 sm:col-span-2">
          Email (optional)
          <input name="email" type="email" className={field} placeholder="you@email.com" />
        </label>
        <label className="text-xs font-bold text-slate-400 sm:col-span-2">
          Service
          <select name="service" required defaultValue={defaultService} className={field}>
            <option value="" className="bg-slate-900">
              Select service
            </option>
            {services.map((s) => (
              <option key={s} value={s} className="bg-slate-900">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-400">
          Size
          <input name="size" className={field} placeholder="e.g. 8×4 ft / A4" />
        </label>
        <label className="text-xs font-bold text-slate-400">
          Quantity
          <input name="quantity" type="number" min={1} defaultValue={1} className={field} />
        </label>
        <label className="text-xs font-bold text-slate-400 sm:col-span-2">
          Material / finishing
          <input name="material" className={field} placeholder="e.g. 300 GSM matte" />
        </label>
        <label className="text-xs font-bold text-slate-400 sm:col-span-2">
          Details
          <textarea name="notes" rows={4} className={field} placeholder="Deadline, colours, delivery…" />
        </label>
      </div>
      {message ? (
        <p className={`mt-4 text-sm font-medium ${status === "ok" ? "text-emerald-400" : "text-rose-400"}`}>{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Submit quote request"}
      </button>
    </form>
  );
}
