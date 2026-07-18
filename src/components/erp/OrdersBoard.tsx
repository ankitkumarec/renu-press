"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, FileDown, Filter } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  serviceName: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  customerPhone: string | null;
  paidAmount: number;
  dueAmount: number;
  total: number;
  billNo: string | null;
  createdAt: string;
  customer: { name: string; phone: string | null };
};

export function OrdersBoard() {
  const [days, setDays] = useState(7);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/erp/orders?days=${days}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markPaid(id: string, total: number) {
    await fetch("/api/erp/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paidAmount: total, paymentStatus: "PAID" }),
    });
    void load();
  }

  function printInvoice(o: Order) {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    const phone = o.customerPhone || o.customer.phone || "—";
    w.document.write(`<!DOCTYPE html><html><head><title>${o.orderNumber}</title>
      <style>
        body{font-family:Segoe UI,Arial;padding:32px;color:#0f172a}
        h1{margin:0 0 4px;font-size:22px}
        .muted{color:#64748b;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        td,th{border:1px solid #e2e8f0;padding:8px;text-align:left;font-size:13px}
        th{background:#f1f5f9}
        .tot{font-size:18px;font-weight:800;margin-top:16px}
        @media print{button{display:none}}
      </style></head><body>
      <h1>RENU PRESS — Tax Invoice</h1>
      <p class="muted">Order ${o.orderNumber}${o.billNo ? ` · Bill ${o.billNo}` : ""} · ${new Date(o.createdAt).toLocaleString("en-IN")}</p>
      <p><b>Customer:</b> ${o.customer.name}<br/><b>Phone:</b> ${phone}</p>
      <table><tr><th>Service / Items</th><th>Status</th><th>Payment</th></tr>
      <tr><td>${o.serviceName}</td><td>${o.status}</td><td>${o.paymentMethod || "—"} · ${o.paymentStatus}</td></tr></table>
      <p class="tot">Total: ₹${o.total.toLocaleString("en-IN")}</p>
      <p>Paid: ₹${(o.paidAmount || 0).toLocaleString("en-IN")} · Due: ₹${(o.dueAmount || 0).toLocaleString("en-IN")}</p>
      <p class="muted">GST invoice — use with your GSTIN from Settings. Generated for tax record.</p>
      <button onclick="window.print()">Print / Save PDF</button>
      </body></html>`);
    w.document.close();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {[7, 14, 28, 0].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              days === d ? "bg-violet-600 text-white" : "border border-white/10 text-slate-400"
            }`}
          >
            {d === 0 ? "All" : `Last ${d} days`}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-3">Order</th>
              <th className="px-3 py-3">Customer / Phone</th>
              <th className="px-3 py-3">Service</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Pay</th>
              <th className="px-3 py-3 text-right">Total / Paid / Due</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const phone = o.customerPhone || o.customer.phone;
                return (
                  <tr key={o.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 font-semibold">
                      {o.orderNumber}
                      <div className="text-[10px] text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>{o.customer.name}</div>
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400"
                        >
                          <Phone className="h-3 w-3" /> {phone}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">No phone</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-400 max-w-[180px] truncate">{o.serviceName}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div>{o.paymentMethod || "—"}</div>
                      <div className="text-slate-500">{o.paymentStatus}</div>
                    </td>
                    <td className="px-3 py-3 text-right text-xs tabular-nums">
                      <div className="font-bold text-white">₹{o.total.toLocaleString("en-IN")}</div>
                      <div className="text-emerald-400">Paid ₹{(o.paidAmount || 0).toLocaleString("en-IN")}</div>
                      <div className="text-rose-300">Due ₹{(o.dueAmount || 0).toLocaleString("en-IN")}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => printInvoice(o)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300"
                        >
                          <FileDown className="h-3 w-3" /> PDF/Print
                        </button>
                        {o.dueAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => void markPaid(o.id, o.total)}
                            className="text-[11px] font-bold text-emerald-400"
                          >
                            Mark paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            {!loading && orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No orders in this period — bill se “Order me” dabao.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
