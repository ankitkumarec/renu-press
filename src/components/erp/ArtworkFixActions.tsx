"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const FIXES = [
  { id: "cmyk", label: "RGB → CMYK conversion (copy)" },
  { id: "upscale", label: "AI upscale (copy)" },
  { id: "bleed", label: "Add bleed template guide" },
  { id: "bg_remove", label: "Background remove (copy)" },
  { id: "pdfx", label: "PDF/X export checklist" },
  { id: "mockup", label: "Generate mockup preview" },
];

export function ArtworkFixActions({
  inspectionId,
  requestedFixes,
}: {
  inspectionId: string;
  requestedFixes: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  let existing: string[] = [];
  try {
    existing = JSON.parse(requestedFixes || "[]") as string[];
  } catch {
    existing = [];
  }
  const [selected, setSelected] = useState<string[]>(existing);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function save() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/erp/artwork", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionId, requestedFixes: selected }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg("Queued optional fixes (original untouched).");
        router.refresh();
      } else setMsg(data.message || "Failed");
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
      <h2 className="text-sm font-bold text-white">Optional AI / pre-press actions</h2>
      <p className="mt-1 text-[11px] text-slate-500">
        Ye sab <strong className="text-slate-300">copy</strong> banate hain — original file kabhi change nahi hoti.
      </p>
      <ul className="mt-3 space-y-2">
        {FIXES.map((f) => (
          <li key={f.id}>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={selected.includes(f.id)}
                onChange={() => toggle(f.id)}
                className="rounded border-white/20"
              />
              {f.label}
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="mt-4 rounded-full bg-gradient-to-r from-cyan-600 to-violet-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        Save requested fixes
      </button>
      {msg ? <p className="mt-2 text-xs text-emerald-300">{msg}</p> : null}
    </section>
  );
}
