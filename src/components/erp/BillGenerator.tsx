"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { FileImage, Download, Plus, Trash2, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";

type Line = { name: string; qty: number; rate: number };

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
  const [billNo, setBillNo] = useState(nextBillNo);
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [lines, setLines] = useState<Line[]>([{ name: "Flex Banner 8x4", qty: 1, rate: 1200 }]);
  const [note, setNote] = useState("Thank you for choosing RENU PRESS.");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gstPct, setGstPct] = useState(18);
  const [waBusy, setWaBusy] = useState(false);
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
  const [sentOk, setSentOk] = useState(false);

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
    drawBill();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `${billNo}.png`);
    }, "image/png");
  }

  /**
   * Real image send path:
   * 1) PNG server pe save → public URL
   * 2) WhatsApp Cloud API se image message (agar keys hain) — true auto-send
   * 3) Warna Web Share se sirf PNG file (WhatsApp choose)
   */
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

      // Server: store + optional Cloud API auto image send
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

      // —— SUCCESS: Cloud API ne IMAGE bhej di (browser me WA page nahi khulega) ——
      if (res.ok && data.ok && data.mode === "cloud_api") {
        setSentOk(true);
        setWaStatus(
          data.message ||
            "✓ Bill IMAGE WhatsApp pe chali gayi. Apne phone pe +1 555… / business chat check karo — text nahi, PNG image.",
        );
        return;
      }

      // API fail — clear error, NEVER open api.whatsapp.com text page
      const errMsg =
        data.message ||
        data.cloudApiError ||
        (res.status === 401 ? "ERP login expire — dubara login karo" : "WhatsApp image send fail");

      setSentOk(false);
      setWaStatus(`✗ ${errMsg}`);

      // Optional: share sheet only if user wants (no automatic browser WA redirect)
      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean;
        share?: (d: ShareData) => Promise<void>;
      };
      if (typeof nav.canShare === "function" && nav.canShare({ files: [file] }) && nav.share) {
        const tryShare = window.confirm(
          `Cloud API se image nahi gayi:\n${errMsg}\n\nShare sheet se WhatsApp try karein?`,
        );
        if (tryShare) {
          try {
            await nav.share({ files: [file] });
            setSentOk(true);
            setWaStatus("✓ Share se PNG bheji.");
            return;
          } catch {
            /* cancel */
          }
        }
      }

      alert(`WhatsApp image fail:\n${errMsg}`);
    } catch (e) {
      console.error(e);
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
          Customer WhatsApp (jis number pe image jayegi)
          <input
            className={field}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="9876543210"
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
            <Download className="h-4 w-4" /> PNG save
          </button>
          <button
            type="button"
            disabled={waBusy}
            onClick={() => void openWhatsApp()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {waBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            WhatsApp pe image bhejo
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
                Bill image link:{" "}
                <a href={lastImageUrl} target="_blank" rel="noreferrer" className="text-cyan-300 underline">
                  open PNG
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
          <p className="font-bold text-slate-300">Image WhatsApp pe kaise jayegi?</p>
          <ol className="mt-1 list-decimal space-y-1 pl-4">
            <li>
              <strong className="text-emerald-300">Best (auto):</strong> Vercel pe{" "}
              <code className="text-violet-300">WHATSAPP_ACCESS_TOKEN</code> +{" "}
              <code className="text-violet-300">WHATSAPP_PHONE_NUMBER_ID</code> set karo → image seedha customer pe.
            </li>
            <li>
              <strong className="text-cyan-300">Phone:</strong> Share list me WhatsApp choose → sirf PNG.
            </li>
            <li>
              <strong className="text-orange-300">PC + WhatsApp Web:</strong> right side bill image ko{" "}
              <em>drag</em> karke chat box pe <em>drop</em> karo — image chat me aa jayegi (download nahi).
            </li>
          </ol>
        </div>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white p-3 shadow-xl">
        <p className="mb-2 text-xs font-bold text-slate-600">
          Bill PNG — WhatsApp Web pe <span className="text-emerald-600">drag & drop</span> kar sakte ho
        </p>
        <canvas ref={canvasRef} className="hidden" />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Bill preview — drag to WhatsApp"
            draggable
            title="Is image ko WhatsApp Web chat pe drag karke chhodo"
            className="w-full cursor-grab rounded-lg border-2 border-dashed border-emerald-400/80 active:cursor-grabbing"
            onDragStart={(e) => {
              // Help some browsers understand it's a file drag
              e.dataTransfer.setData("text/uri-list", previewUrl);
              e.dataTransfer.setData("text/plain", previewUrl);
              e.dataTransfer.effectAllowed = "copy";
            }}
          />
        ) : (
          <div className="grid h-64 place-items-center text-sm text-slate-400">Generating…</div>
        )}
        <p className="mt-2 text-center text-[10px] text-slate-500">
          Tip: WhatsApp Web (web.whatsapp.com) open rakho → ye image chat pe khinch ke chhodo → Send
        </p>
      </div>
    </div>
  );
}
