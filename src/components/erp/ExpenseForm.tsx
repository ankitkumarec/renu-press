"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { EXPENSE_CATEGORIES } from "@/lib/roles";
import { parseExpenseFromFilename, parseExpenseFromText, type OcrExpenseDraft } from "@/lib/ocr";
import { Upload, Sparkles } from "lucide-react";

export function ExpenseForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ocr, setOcr] = useState<OcrExpenseDraft | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: EXPENSE_CATEGORIES[0],
    amount: "",
    expenseDate: new Date().toISOString().slice(0, 10),
    vendorName: "",
    paymentMethod: "UPI",
    bankName: "",
    upiRef: "",
    referenceNo: "",
    billNumber: "",
    gstAmount: "",
    gstNumber: "",
    description: "",
    proofDataUrl: "",
    proofName: "",
    ocrRaw: "",
  });

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setPreview(file.type.startsWith("image/") ? dataUrl : null);
      const fromName = parseExpenseFromFilename(file.name);
      // Try read as text for PDF/text-ish demos
      const draft = parseExpenseFromText(`${file.name} ${fromName.raw}`);
      const merged = { ...fromName, ...draft, proofName: file.name };
      setOcr(merged);
      setForm((f) => ({
        ...f,
        proofDataUrl: dataUrl,
        proofName: file.name,
        ocrRaw: merged.raw,
        amount: merged.amount != null ? String(merged.amount) : f.amount,
        expenseDate: merged.expenseDate || f.expenseDate,
        vendorName: merged.vendorName || f.vendorName,
        billNumber: merged.billNumber || f.billNumber,
        upiRef: merged.upiRef || f.upiRef,
        gstNumber: merged.gstNumber || f.gstNumber,
        title: merged.title || f.title || `Expense — ${file.name}`,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/erp/expenses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount || "0"),
        gstAmount: parseFloat(form.gstAmount || "0"),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.message || "Failed");
      return;
    }
    setMsg("Expense saved with proof.");
    setForm({
      title: "",
      category: EXPENSE_CATEGORIES[0],
      amount: "",
      expenseDate: new Date().toISOString().slice(0, 10),
      vendorName: "",
      paymentMethod: "UPI",
      bankName: "",
      upiRef: "",
      referenceNo: "",
      billNumber: "",
      gstAmount: "",
      gstNumber: "",
      description: "",
      proofDataUrl: "",
      proofName: "",
      ocrRaw: "",
    });
    setPreview(null);
    setOcr(null);
    router.refresh();
  }

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50";

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Sparkles className="h-4 w-4 text-violet-400" />
        New expense + OCR
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-violet-500/40 bg-violet-500/5 px-4 py-6 text-center transition hover:bg-violet-500/10">
        <Upload className="h-6 w-6 text-violet-300" />
        <span className="mt-2 text-xs font-bold text-violet-200">Upload bill / screenshot / PDF</span>
        <span className="mt-1 text-[10px] text-slate-500">OCR auto-fills amount, date, UPI, GST</span>
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={onFile} />
      </label>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Proof" className="max-h-40 w-full rounded-xl object-contain bg-black/40" />
      ) : null}
      {ocr ? (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[11px] text-cyan-100">
          OCR confidence {(ocr.confidence * 100).toFixed(0)}% — confirm fields below
        </div>
      ) : null}

      <label className="block text-[11px] font-bold text-slate-400">
        Title
        <input className={field} value={form.title} onChange={(e) => setField("title", e.target.value)} required />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] font-bold text-slate-400">
          Amount
          <input className={field} type="number" step="0.01" value={form.amount} onChange={(e) => setField("amount", e.target.value)} required />
        </label>
        <label className="block text-[11px] font-bold text-slate-400">
          Date
          <input className={field} type="date" value={form.expenseDate} onChange={(e) => setField("expenseDate", e.target.value)} />
        </label>
      </div>
      <label className="block text-[11px] font-bold text-slate-400">
        Category
        <select className={field} value={form.category} onChange={(e) => setField("category", e.target.value)}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-slate-900">
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] font-bold text-slate-400">
        Vendor
        <input className={field} value={form.vendorName} onChange={(e) => setField("vendorName", e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] font-bold text-slate-400">
          Method
          <select className={field} value={form.paymentMethod} onChange={(e) => setField("paymentMethod", e.target.value)}>
            {["CASH", "UPI", "BANK", "CARD", "CHEQUE"].map((m) => (
              <option key={m} value={m} className="bg-slate-900">
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[11px] font-bold text-slate-400">
          UPI / UTR
          <input className={field} value={form.upiRef} onChange={(e) => setField("upiRef", e.target.value)} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] font-bold text-slate-400">
          Bill no.
          <input className={field} value={form.billNumber} onChange={(e) => setField("billNumber", e.target.value)} />
        </label>
        <label className="block text-[11px] font-bold text-slate-400">
          GSTIN
          <input className={field} value={form.gstNumber} onChange={(e) => setField("gstNumber", e.target.value)} />
        </label>
      </div>
      <label className="block text-[11px] font-bold text-slate-400">
        Description
        <textarea className={field} rows={2} value={form.description} onChange={(e) => setField("description", e.target.value)} />
      </label>

      {msg ? <p className="text-xs font-semibold text-emerald-400">{msg}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save expense"}
      </button>
    </form>
  );
}
