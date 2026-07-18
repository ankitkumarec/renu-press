"use client";

import { useEffect, useState } from "react";
import { FileStack } from "lucide-react";

type Doc = {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileName: string | null;
  createdAt: string;
};

const CATEGORIES = ["GST", "PAN", "Bill", "Salary", "Warranty", "Agreement", "Other"];

export function DocumentsManager() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("GST");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  async function load() {
    const res = await fetch("/api/erp/documents");
    const data = await res.json();
    setDocs(data.docs || []);
  }
  useEffect(() => {
    void load();
  }, []);

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4_500_000) {
      alert("File 4.5MB se chhoti rakho (DB storage)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(String(reader.result || ""));
      setFileName(f.name);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    };
    reader.readAsDataURL(f);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!fileUrl) {
      alert("File choose karo");
      return;
    }
    await fetch("/api/erp/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, fileUrl, fileName }),
    });
    setTitle("");
    setFileUrl("");
    setFileName("");
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Delete document?")) return;
    await fetch(`/api/erp/documents?id=${id}`, { method: "DELETE" });
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-slate-300">
        <p className="font-bold text-violet-200">Document vault kyun?</p>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
          Yahan shop ke important papers rakhte hain — GST certificate, PAN, machine warranty, agreements,
          salary slips, supplier bills. Ek jagah safe + turant download.
        </p>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 max-w-xl">
        <h2 className="text-sm font-bold">Upload document</h2>
        <input className={field} placeholder="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input className={field} type="file" accept=".pdf,image/*,.png,.jpg,.jpeg" onChange={onFile} />
        {fileName && <p className="text-[11px] text-emerald-400">{fileName}</p>}
        <button type="submit" className="rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold">
          Save to vault
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <div key={d.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
              <FileStack className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{d.title}</div>
              <div className="text-xs text-slate-500">
                {d.category} · {d.fileName || "file"}
              </div>
              <div className="mt-2 flex gap-3 text-[11px] font-bold">
                <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-cyan-400">
                  Open
                </a>
                <button type="button" className="text-rose-400" onClick={() => void remove(d.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {docs.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-white/15 py-12 text-center text-slate-500">
            Vault empty — GST / PAN / warranty upload karo.
          </div>
        )}
      </div>
    </div>
  );
}
