"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    const data = await res.json();
    setOk(res.ok);
    setMsg(data.message);
    if (res.ok) e.currentTarget.reset();
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50";

  return (
    <form onSubmit={onSubmit} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
      <h2 className="font-display text-xl font-bold tracking-tight text-white">Inquiry form</h2>
      <div className="mt-5 grid gap-4">
        <label className="text-xs font-bold text-slate-400">
          Name
          <input name="name" required className={field} />
        </label>
        <label className="text-xs font-bold text-slate-400">
          Phone
          <input name="phone" required className={field} />
        </label>
        <label className="text-xs font-bold text-slate-400">
          Email
          <input name="email" type="email" className={field} />
        </label>
        <label className="text-xs font-bold text-slate-400">
          Message
          <textarea name="message" required rows={5} className={field} />
        </label>
      </div>
      {msg ? <p className={`mt-3 text-sm ${ok ? "text-emerald-400" : "text-rose-400"}`}>{msg}</p> : null}
      <button
        type="submit"
        className="mt-5 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25"
      >
        Send message
      </button>
    </form>
  );
}
