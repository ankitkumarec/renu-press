"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExpenseDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("Is expense ko delete karein?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/erp/expenses?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || "Fail");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete fail");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onDelete()}
      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
