"use client";

import { useState, type FormEvent } from "react";

export default function TrackPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    orderNumber: string;
    serviceName: string;
    status: string;
    paymentStatus: string;
    quantity: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const res = await fetch(`/api/track?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Not found");
      return;
    }
    setResult(data.order);
  }

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-narrow py-16 sm:py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Track order</h1>
        <p className="mt-3 text-[var(--color-muted)]">Enter your order number or tracking code.</p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. RP-2026-0001"
            className="flex-1 rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-ink)]"
          />
          <button type="submit" className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-white">
            Track
          </button>
        </form>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {result ? (
          <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-white p-6">
            <div className="text-xs text-[var(--color-muted)]">Order</div>
            <div className="font-display text-2xl font-semibold">{result.orderNumber}</div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-muted)]">Service</dt>
                <dd className="font-medium">{result.serviceName}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Status</dt>
                <dd className="font-medium">{result.status}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Payment</dt>
                <dd className="font-medium">{result.paymentStatus}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Qty / Total</dt>
                <dd className="font-medium">
                  {result.quantity} · ₹{result.total.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
