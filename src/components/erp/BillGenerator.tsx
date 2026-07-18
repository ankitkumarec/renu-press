"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  FileImage,
  Download,
  Plus,
  Trash2,
  ImagePlus,
  Loader2,
  CheckCircle2,
  Printer,
  ShoppingCart,
} from "lucide-react";

type Line = { name: string; qty: number; rate: number; inventoryId?: string };
type StockItem = { id: string; name: string; quantity: number; unit: string };

function nextBillNo() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const r = String(Math.floor(1000 + Math.random() * 9000));
  return `RP-${y}${m}-${r}`;
}

function canvasToPngFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("PNG ban nahi paya"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/png" }));
      },
      "image/png",
      0.92,
    );
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function BillGenerator({
  businessName = "RENU PRESS",
  address = "Saharsa, Bihar",
  phone = "",
}: {
  businessName?: string;
  address?: string;
  phone?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [billNo, setBillNo] = useState(nextBillNo);
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [lines, setLines] = useState<Line[]>([{ name: "Flex Banner 8x4", qty: 1, rate: 1200 }]);
  const [note, setNote] = useState("Thank you for choosing RENU PRESS.");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gstPct, setGstPct] = useState(18);
  /** string so empty field shows blank / 0, not sticky "01" */
  const [gstInput, setGstInput] = useState("18");
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT");
  const [discountVal, setDiscountVal] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [waBusy, setWaBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
  const [sentOk, setSentOk] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    fetch("/api/erp/inventory")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setStockItems(d.items.map((i: StockItem & { id: string }) => i));
      })
      .catch(() => {});
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const discountAmt =
    discountType === "PERCENT"
      ? Math.round((subtotal * Math.min(100, Math.max(0, discountVal))) / 100)
      : Math.min(subtotal, Math.max(0, discountVal));
  const afterDisc = Math.max(0, subtotal - discountAmt);
  const gst = Math.round((afterDisc * gstPct) / 100);
  const total = afterDisc + gst;
  const due = Math.max(0, total - Math.min(total, paidAmount));

  function drawBill() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 720;
    const h = 1000 + Math.max(0, lines.length - 3) * 36;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "#ea580c");
    grad.addColorStop(0.5, "#db2777");
    grad.addColorStop(1, "#7c3aed");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, 110);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px Segoe UI, Arial";
    ctx.fillText(businessName, 36, 48);
    ctx.font = "14px Segoe UI, Arial";
    ctx.fillText("Printing & Branding · Saharsa, Bihar", 36, 74);
    ctx.font = "12px Segoe UI, Arial";
    ctx.fillText(address.slice(0, 60), 36, 94);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px Segoe UI, Arial";
    ctx.fillText("TAX INVOICE / BILL", 36, 150);
    ctx.font = "14px Segoe UI, Arial";
    ctx.fillStyle = "#475569";
    ctx.fillText(`Bill No: ${billNo}`, 36, 178);
    ctx.fillText(`Date: ${new Date().toLocaleDateString("en-IN")}`, 36, 200);
    if (phone) ctx.fillText(`Shop: ${phone}`, 400, 178);

    // Larger Bill To block so name + phone don't look cramped
    ctx.fillStyle = "#eef2ff";
    ctx.fillRect(36, 218, w - 72, 100);
    ctx.strokeStyle = "#c7d2fe";
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 218, w - 72, 100);
    ctx.fillStyle = "#4338ca";
    ctx.font = "bold 12px Segoe UI, Arial";
    ctx.fillText("BILL TO", 52, 242);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 20px Segoe UI, Arial";
    ctx.fillText((customerName || "Customer").slice(0, 40), 52, 272);
    ctx.font = "15px Segoe UI, Arial";
    ctx.fillStyle = "#334155";
    ctx.fillText(`Phone / WhatsApp: ${whatsapp || "—"}`, 52, 298);

    let y = 340;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(36, y, w - 72, 36);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Segoe UI, Arial";
    ctx.fillText("#", 48, y + 24);
    ctx.fillText("Item", 80, y + 24);
    ctx.fillText("Qty", 420, y + 24);
    ctx.fillText("Rate", 500, y + 24);
    ctx.fillText("Amount", 600, y + 24);

    y += 36;
    ctx.font = "14px Segoe UI, Arial";
    lines.forEach((line, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
      ctx.fillStyle = bg;
      ctx.fillRect(36, y, w - 72, 36);
      ctx.fillStyle = "#0f172a";
      ctx.fillText(String(i + 1), 48, y + 24);
      ctx.fillText(line.name.slice(0, 36), 80, y + 24);
      ctx.fillText(String(line.qty), 430, y + 24);
      ctx.fillText(String(line.rate), 500, y + 24);
      ctx.fillText(String(line.qty * line.rate), 600, y + 24);
      y += 36;
    });

    y += 16;
    ctx.fillStyle = "#475569";
    ctx.font = "14px Segoe UI, Arial";
    ctx.fillText("Subtotal", 480, y);
    ctx.fillText(`₹${subtotal.toLocaleString("en-IN")}`, 600, y);
    y += 22;
    if (discountAmt > 0) {
      ctx.fillText(
        `Discount (${discountType === "PERCENT" ? discountVal + "%" : "₹"})`,
        480,
        y,
      );
      ctx.fillText(`-₹${discountAmt.toLocaleString("en-IN")}`, 600, y);
      y += 22;
    }
    ctx.fillText(`GST (${gstPct}%)`, 480, y);
    ctx.fillText(`₹${gst.toLocaleString("en-IN")}`, 600, y);
    y += 28;
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px Segoe UI, Arial";
    ctx.fillText("TOTAL", 480, y);
    ctx.fillText(`₹${total.toLocaleString("en-IN")}`, 600, y);
    y += 26;
    ctx.font = "13px Segoe UI, Arial";
    ctx.fillStyle = "#475569";
    ctx.fillText(`Paid (${paymentMethod}): ₹${Math.min(paidAmount, total).toLocaleString("en-IN")}`, 480, y);
    y += 20;
    ctx.fillText(`Due: ₹${due.toLocaleString("en-IN")}`, 480, y);

    y += 40;
    ctx.fillStyle = "#64748b";
    ctx.font = "12px Segoe UI, Arial";
    const noteLines = (note || "").match(/.{1,70}/g) || [];
    noteLines.forEach((ln, i) => ctx.fillText(ln, 36, y + i * 18));

    y = h - 50;
    ctx.fillStyle = "#ea580c";
    ctx.font = "bold 13px Segoe UI, Arial";
    ctx.fillText("RENU PRESS · Thank you for your business", 36, y);

    setPreviewUrl(canvas.toDataURL("image/png"));
  }

  useEffect(() => {
    drawBill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    billNo,
    customerName,
    whatsapp,
    lines,
    note,
    gstPct,
    discountType,
    discountVal,
    paidAmount,
    paymentMethod,
    businessName,
    address,
    phone,
  ]);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function downloadPng() {
    drawBill();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `${billNo}.png`);
    }, "image/png");
  }

  function printBill() {
    drawBill();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const w = window.open("", "_blank", "width=800,height=1000");
    if (!w) {
      alert("Popup blocked — allow popups for print");
      return;
    }
    w.document.write(`<!DOCTYPE html><html><head><title>${billNo}</title>
      <style>body{margin:0;display:grid;place-items:center;background:#fff}
      img{max-width:100%;height:auto}@media print{body{margin:0}}</style></head>
      <body><img src="${dataUrl}" onload="window.print();window.onafterprint=()=>window.close()"/></body></html>`);
    w.document.close();
  }

  async function saveAsOrder() {
    if (!customerName.trim()) {
      alert("Customer name daalo");
      return;
    }
    setSaveBusy(true);
    try {
      const stockDeductions = lines
        .filter((l) => l.inventoryId)
        .map((l) => ({ itemId: l.inventoryId!, qty: l.qty }));
      const res = await fetch("/api/erp/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone: whatsapp,
          serviceName: lines.map((l) => l.name).join(", ").slice(0, 120),
          quantity: lines.reduce((s, l) => s + l.qty, 0),
          subtotal,
          tax: gst,
          total,
          discount: discountAmt,
          discountType,
          gstPct,
          paidAmount: Math.min(paidAmount, total),
          paymentMethod,
          billNo,
          itemsJson: JSON.stringify(lines),
          notes: note,
          status: "CONFIRMED",
          stockDeductions,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Order save fail");
      setWaStatus(`✓ Order saved: ${data.order.orderNumber} · Stock updated where linked`);
      setSentOk(true);
      alert(`Order ban gaya: ${data.order.orderNumber}\nOrders page pe check karo.`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save fail");
    } finally {
      setSaveBusy(false);
    }
  }

  async function openWhatsApp() {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) {
      alert("WhatsApp number sahi daalo (10 digit)");
      return;
    }
    setWaBusy(true);
    setWaStatus(null);
    setSentOk(false);
    setLastImageUrl(null);
    try {
      drawBill();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Bill preview ready nahi");
      const fileName = `${billNo}.png`;
      const file = await canvasToPngFile(canvas, fileName);
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch("/api/erp/bills/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billNo,
          customerName,
          whatsapp: digits,
          total,
          imageBase64: dataUrl,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        mode?: string;
        imageUrl?: string;
        message?: string;
        cloudApiError?: string;
      };
      setLastImageUrl(data.imageUrl || null);
      if (res.ok && data.ok && data.mode === "cloud_api") {
        setSentOk(true);
        setWaStatus(data.message || "✓ Bill IMAGE WhatsApp pe chali gayi.");
        return;
      }
      const errMsg =
        data.message ||
        data.cloudApiError ||
        (res.status === 401 ? "ERP login expire" : "WhatsApp image send fail");
      setSentOk(false);
      setWaStatus(`✗ ${errMsg}`);
      alert(`WhatsApp image fail:\n${errMsg}`);
    } catch (e) {
      setWaStatus(e instanceof Error ? e.message : "Fail");
      alert(e instanceof Error ? e.message : "WhatsApp fail");
    } finally {
      setWaBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    drawBill();
  }

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50";

  return (
    <div className="grid gap-6 xl:grid-cols-2" ref={printRef}>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <FileImage className="h-4 w-4 text-violet-400" /> Bill generator
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[11px] font-bold text-slate-400">
            Bill number
            <input className={field} value={billNo} onChange={(e) => setBillNo(e.target.value)} required />
          </label>
          <label className="block text-[11px] font-bold text-slate-400">
            GST %
            <input
              className={field}
              type="number"
              min={0}
              step={1}
              value={gstInput}
              onChange={(e) => {
                const v = e.target.value;
                // allow empty while typing; avoid forcing "01"
                if (v === "" || v === "-") {
                  setGstInput("");
                  setGstPct(0);
                  return;
                }
                const n = Number(v);
                if (Number.isNaN(n)) return;
                setGstInput(String(n));
                setGstPct(Math.max(0, n));
              }}
              onBlur={() => {
                if (gstInput === "") {
                  setGstInput("0");
                  setGstPct(0);
                }
              }}
            />
          </label>
        </div>
        <label className="block text-[11px] font-bold text-slate-400">
          Customer name
          <input className={field} value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        </label>
        <label className="block text-[11px] font-bold text-slate-400">
          Customer phone / WhatsApp
          <input
            className={field}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="7004968193"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[11px] font-bold text-slate-400">
            Discount type
            <select
              className={field}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "FLAT" | "PERCENT")}
            >
              <option value="FLAT">₹ Rupees</option>
              <option value="PERCENT">% Percent</option>
            </select>
          </label>
          <label className="block text-[11px] font-bold text-slate-400">
            Discount {discountType === "PERCENT" ? "%" : "₹"}
            <input
              className={field}
              type="number"
              min={0}
              value={discountVal}
              onChange={(e) => setDiscountVal(Number(e.target.value) || 0)}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[11px] font-bold text-slate-400">
            Payment mode
            <select className={field} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="CASH">Cash</option>
              <option value="ONLINE">Online</option>
              <option value="UPI">UPI</option>
              <option value="PARTIAL">Partial</option>
              <option value="CARD">Card</option>
            </select>
          </label>
          <label className="block text-[11px] font-bold text-slate-400">
            Paid now ₹
            <input
              className={field}
              type="number"
              min={0}
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Items (stock link optional → bill pe auto minus)</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-violet-300"
              onClick={() => setLines((l) => [...l, { name: "New item", qty: 1, rate: 100 }])}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="space-y-1 rounded-xl border border-white/5 p-2">
              <div className="grid grid-cols-12 gap-1.5">
                <input
                  className={`${field} col-span-6 !mt-0`}
                  value={line.name}
                  onChange={(e) => updateLine(i, { name: e.target.value })}
                />
                <input
                  className={`${field} col-span-2 !mt-0`}
                  type="number"
                  value={line.qty}
                  onChange={(e) => updateLine(i, { qty: Number(e.target.value) || 0 })}
                />
                <input
                  className={`${field} col-span-3 !mt-0`}
                  type="number"
                  value={line.rate}
                  onChange={(e) => updateLine(i, { rate: Number(e.target.value) || 0 })}
                />
                <button
                  type="button"
                  className="col-span-1 grid place-items-center text-rose-400"
                  onClick={() => setLines((l) => l.filter((_, idx) => idx !== i))}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {stockItems.length > 0 && (
                <select
                  className={`${field} !mt-0 text-xs`}
                  value={line.inventoryId || ""}
                  onChange={(e) => {
                    const id = e.target.value || undefined;
                    const it = stockItems.find((s) => s.id === id);
                    updateLine(i, {
                      inventoryId: id,
                      name: it ? it.name : line.name,
                    });
                  }}
                >
                  <option value="">— Stock se link (optional) —</option>
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.quantity} {s.unit})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <label className="block text-[11px] font-bold text-slate-400">
          Note on bill
          <textarea className={field} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div className="rounded-xl bg-white/5 px-3 py-2 text-sm space-y-1">
          <div>
            Subtotal: ₹{subtotal.toLocaleString("en-IN")}
            {discountAmt > 0 ? ` − Disc ₹${discountAmt.toLocaleString("en-IN")}` : ""}
          </div>
          <div>
            GST ({gstPct}%): ₹{gst.toLocaleString("en-IN")}
          </div>
          <div>
            Total: <span className="font-black text-orange-300">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div className="text-xs text-slate-400">
            Paid ₹{Math.min(paidAmount, total).toLocaleString("en-IN")} ({paymentMethod}) · Due{" "}
            <span className="text-rose-300 font-bold">₹{due.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={downloadPng}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-xs font-bold"
          >
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
          <button
            type="button"
            onClick={printBill}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-bold text-cyan-200"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button
            type="button"
            disabled={saveBusy}
            onClick={() => void saveAsOrder()}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/15 py-2.5 text-xs font-bold text-violet-100 disabled:opacity-60"
          >
            {saveBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            Order me
          </button>
          <button
            type="button"
            disabled={waBusy}
            onClick={() => void openWhatsApp()}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {waBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            WA
          </button>
        </div>

        {waStatus ? (
          <div
            className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${
              sentOk
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
                : "border-amber-500/30 bg-amber-500/10 text-amber-50"
            }`}
          >
            {sentOk ? <CheckCircle2 className="mb-1 inline h-4 w-4" /> : null} {waStatus}
            {lastImageUrl ? (
              <div className="mt-2 break-all text-[10px] text-slate-400">
                <a href={lastImageUrl} target="_blank" rel="noreferrer" className="text-cyan-300 underline">
                  open PNG
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
      </form>

      <div className="rounded-2xl border border-white/10 bg-white p-3 shadow-xl">
        <p className="mb-2 text-xs font-bold text-slate-600">Bill preview · Print / PNG / WA / Order</p>
        <canvas ref={canvasRef} className="hidden" />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Bill preview"
            draggable
            className="w-full rounded-lg border-2 border-dashed border-emerald-400/80"
          />
        ) : (
          <div className="grid h-64 place-items-center text-sm text-slate-400">Generating…</div>
        )}
      </div>
    </div>
  );
}
