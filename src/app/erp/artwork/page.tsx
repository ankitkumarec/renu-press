import Link from "next/link";
import { prisma } from "@/lib/db";
import { ScanSearch } from "lucide-react";

function gradeClass(g: string) {
  if (g === "Excellent") return "text-emerald-300 bg-emerald-500/15";
  if (g === "Good") return "text-cyan-300 bg-cyan-500/15";
  if (g === "Average") return "text-amber-300 bg-amber-500/15";
  if (g === "Needs Improvement") return "text-orange-300 bg-orange-500/15";
  return "text-rose-300 bg-rose-500/15";
}

export default async function ErpArtworkListPage() {
  const rows = await prisma.artworkInspection.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-cyan-300">
          <ScanSearch className="h-5 w-5" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Pre-press QC</span>
        </div>
        <h1 className="font-display mt-1 text-2xl font-black text-white">Artwork Quality Inspector</h1>
        <p className="text-sm text-slate-500">
          Har upload ka print readiness score, warnings, suggestions · original file kabhi modify nahi
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Resolution</th>
                <th className="px-4 py-3">Colour</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{r.fileName}</div>
                    <div className="text-xs text-slate-500">{r.category || r.mimeType}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-lg font-bold text-violet-300">{r.score}%</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${gradeClass(r.grade)}`}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{r.resolutionLevel || "—"}</td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-xs text-slate-400">{r.colourMode || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/erp/artwork/${r.id}`}
                      className="rounded-full bg-cyan-600/20 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-600/30"
                    >
                      Report
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No inspections yet. Upload artwork via Support Desk.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
