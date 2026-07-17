"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FileImage, MessageCircle, Download, Plus, Trash2 } from "lucide-react";

type Line = { name: string; qty: number; rate: number };

function nextBillNo() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const r = String(Math.floor(1000 + Math.random() * 9000));
  return `RP-${y}${m}-${r}`;
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
  const [billNo, setBillNo] = useState(nextBillNo);
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [lines, setLines] = useState<Line[]>([{ name: "Flex Banner 8x4", qty: 1, rate: 1200 }]);
  const [note, setNote] = useState("Thank you for choosing RENU PRESS.");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gstPct, setGstPct] = useState(18);

  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const gst = Math.round((subtotal * gstPct) / 100);
  const total = subtotal + gst;

  function drawBill() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 720;
    const h = 920 + Math.max(0, lines.length - 3) * 36;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Header bar
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

    // Bill meta
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px Segoe UI, Arial";
    ctx.fillText("TAX INVOICE / BILL", 36, 150);
    ctx.font = "14px Segoe UI, Arial";
    ctx.fillStyle = "#475569";
    ctx.fillText(`Bill No: ${billNo}`, 36, 178);
    ctx.fillText(`Date: ${new Date().toLocaleDateString("en-IN")}`, 36, 200);
    if (phone) ctx.fillText(`Shop: ${phone}`, 400, 178);

    // Customer box
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(36, 220, w - 72, 70);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px Segoe UI, Arial";
    ctx.fillText("Bill To", 48, 244);
    ctx.font = "16px Segoe UI, Arial";
    ctx.fillText(customerName || "Customer", 48, 268);
    ctx.font = "13px Segoe UI, Arial";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`WhatsApp: ${whatsapp || "—"}`, 48, 288);

    // Table header
    let y = 320;
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

    // Totals
    y += 16;
    ctx.fillStyle = "#475569";
    ctx.font = "14px Segoe UI, Arial";
    ctx.fillText("Subtotal", 480, y);
    ctx.fillText(`₹${subtotal.toLocaleString("en-IN")}`, 600, y);
    y += 26;
    ctx.fillText(`GST (${gstPct}%)`, 480, y);
    ctx.fillText(`₹${gst.toLocaleString("en-IN")}`, 600, y);
    y += 32;
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px Segoe UI, Arial";
    ctx.fillText("TOTAL", 480, y);
    ctx.fillText(`₹${total.toLocaleString("en-IN")}`, 600, y);

    y += 50;
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
  }, [billNo, customerName, whatsapp, lines, note, gstPct, businessName, address, phone]);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function downloadPng() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${billNo}.png`;
    a.click();
  }

  function openWhatsApp() {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) {
      alert("WhatsApp number sahi daalo (10 digit, country code 91 optional)");
      return;
    }
    const phoneWa = digits.length === 10 ? `91${digits}` : digits;
    const itemLines = lines.map((l, i) => `${i + 1}. ${l.name} x${l.qty} = ₹${l.qty * l.rate}`).join("\n");
    const text = [
      `*${businessName}* — Bill`,
      `Bill No: ${billNo}`,
      `Customer: ${customerName}`,
      ``,
      itemLines,
      ``,
      `Subtotal: ₹${subtotal}`,
      `GST: ₹${gst}`,
      `*Total: ₹${total}*`,
      ``,
      note,
      ``,
      `(Bill PNG apne phone se attach karke bhej sakte hain — pehle Download PNG.)`,
    ].join("\n");

    // Official deep link — opens WhatsApp chat; image must be attached by user (WA Web/App policy)
    window.open(`https://wa.me/${phoneWa}?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    drawBill();
    // Persist bill meta for records
    await fetch("/api/erp/bills", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        billNo,
        customerName,
        whatsapp,
        items: lines,
        subtotal,
        gst,
        total,
        note,
      }),
    }).catch(() => null);
  }

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50";

  return (
    <div className="grid gap-6 xl:grid-cols-2">
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
              value={gstPct}
              onChange={(e) => setGstPct(Number(e.target.value) || 0)}
            />
          </label>
        </div>
        <label className="block text-[11px] font-bold text-slate-400">
          Customer name
          <input className={field} value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        </label>
        <label className="block text-[11px] font-bold text-slate-400">
          WhatsApp number
          <input
            className={field}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="9876543210 or 919876543210"
            required
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Items</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-violet-300"
              onClick={() => setLines((l) => [...l, { name: "New item", qty: 1, rate: 100 }])}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-1.5">
              <input
                className={`${field} col-span-6`}
                value={line.name}
                onChange={(e) => updateLine(i, { name: e.target.value })}
              />
              <input
                className={`${field} col-span-2`}
                type="number"
                value={line.qty}
                onChange={(e) => updateLine(i, { qty: Number(e.target.value) || 0 })}
              />
              <input
                className={`${field} col-span-3`}
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
          ))}
        </div>

        <label className="block text-[11px] font-bold text-slate-400">
          Note on bill
          <textarea className={field} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div className="rounded-xl bg-white/5 px-3 py-2 text-sm">
          Total: <span className="font-black text-orange-300">₹{total.toLocaleString("en-IN")}</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={downloadPng}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 py-3 text-sm font-bold"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp pe bhejo
          </button>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          WhatsApp official policy: deep link se chat + text open hota hai. PNG pehle Download karke chat me attach
          karein. Auto-blast/bulk spam allowed nahi — dekhne niche note.
        </p>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white p-3 shadow-xl">
        <p className="mb-2 text-xs font-bold text-slate-500">Live PNG preview</p>
        <canvas ref={canvasRef} className="hidden" />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Bill preview" className="w-full rounded-lg border border-slate-200" />
        ) : (
          <div className="grid h-64 place-items-center text-sm text-slate-400">Generating…</div>
        )}
      </div>
    </div>
  );
}
