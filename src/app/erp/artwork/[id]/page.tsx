import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import type { PrintReadinessReport } from "@/lib/prepress/inspector";
import { ArtworkFixActions } from "@/components/erp/ArtworkFixActions";

export default async function ErpArtworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.artworkInspection.findUnique({ where: { id } });
  if (!row) notFound();

  let report: PrintReadinessReport | null = null;
  try {
    report = JSON.parse(row.reportJson) as PrintReadinessReport;
  } catch {
    report = null;
  }

  let warnings: string[] = [];
  let suggestions: string[] = [];
  let suitable: string[] = [];
  try {
    warnings = JSON.parse(row.warnings || "[]") as string[];
    suggestions = JSON.parse(row.suggestions || "[]") as string[];
    suitable = JSON.parse(row.suitableProducts || "[]") as string[];
  } catch {
    /* ignore */
  }

  const revisions = row.supportFileId
    ? await prisma.artworkInspection.findMany({
        where: {
          OR: [{ id: row.id }, { parentId: row.id }, { supportFileId: row.supportFileId }],
        },
        orderBy: { createdAt: "asc" },
      })
    : [row];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/erp/artwork" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> All inspections
        </Link>
        <h1 className="font-display mt-2 text-2xl font-black text-white">{row.fileName}</h1>
        <p className="text-sm text-slate-500">
          Score {row.score}% · {row.grade} · v{row.version} · original preserved
        </p>
        {row.conversationId ? (
          <Link href={`/erp/support/${row.conversationId}`} className="mt-1 inline-block text-xs text-violet-400">
            Open support conversation →
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-7">
          <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Print ready score</div>
                <div className="text-5xl font-black text-white">{row.score}%</div>
                <div className="mt-1 text-sm font-bold text-cyan-300">{row.grade}</div>
              </div>
              <div className="text-sm text-slate-400">
                <div>Resolution: {row.resolutionLevel || "—"}</div>
                <div>Colour: {row.colourMode || "—"}</div>
                <div className="mt-1 max-w-md text-xs">Max size: {row.maxPrintSize || "—"}</div>
              </div>
            </div>
          </section>

          {report ? (
            <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
              <h2 className="text-sm font-bold text-white">Technical checks</h2>
              <div className="mt-3 space-y-2">
                {report.checks.map((c) => (
                  <div
                    key={c.id}
                    className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm"
                  >
                    <span
                      className={
                        c.status === "pass"
                          ? "text-emerald-400"
                          : c.status === "fail"
                            ? "text-rose-400"
                            : c.status === "warn"
                              ? "text-amber-400"
                              : "text-slate-400"
                      }
                    >
                      {c.status === "pass" ? "✓" : c.status === "fail" ? "!" : c.status === "warn" ? "⚠" : "i"}
                    </span>
                    <div>
                      <div className="font-semibold text-white">
                        {c.label}: <span className="font-normal text-slate-300">{c.value}</span>
                      </div>
                      <div className="text-xs text-slate-500">{c.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
            <h2 className="text-sm font-bold text-white">Warnings</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-amber-200/90">
              {warnings.length ? warnings.map((w) => <li key={w}>{w}</li>) : <li className="text-slate-500">None</li>}
            </ul>
            <h2 className="mt-4 text-sm font-bold text-white">Suggestions</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-violet-200/90">
              {suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <ArtworkFixActions inspectionId={row.id} requestedFixes={row.requestedFixes} />
        </div>

        <div className="space-y-4 xl:col-span-5">
          <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
            <h2 className="text-sm font-bold text-white">Suitable products</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suitable.map((p) => (
                <span key={p} className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                  {p}
                </span>
              ))}
            </div>
          </section>

          {report?.visualHints?.length ? (
            <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
              <h2 className="text-sm font-bold text-white">Visual QC zones</h2>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {report.visualHints.map((h, i) => (
                  <li key={i}>
                    <span className="font-bold text-cyan-300">{h.zone}</span> · {h.severity} — {h.note}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
            <h2 className="text-sm font-bold text-white">Revision history</h2>
            <ul className="mt-2 space-y-2 text-xs">
              {revisions.map((rev) => (
                <li key={rev.id}>
                  <Link
                    href={`/erp/artwork/${rev.id}`}
                    className={`block rounded-lg border px-3 py-2 ${rev.id === row.id ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/10 hover:bg-white/5"}`}
                  >
                    <div className="font-semibold text-white">
                      v{rev.version} · {rev.score}% · {rev.grade}
                    </div>
                    <div className="text-slate-500">{new Date(rev.createdAt).toLocaleString("en-IN")}</div>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] text-slate-500">
              Security: original upload never modified. Optional AI fixes create new versions only.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
