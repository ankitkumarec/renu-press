"use client";

import type { PrintReadinessReport } from "@/lib/prepress/inspector";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, ShieldCheck, Sparkles } from "lucide-react";

export function parsePrintReport(metadata?: string | null): PrintReadinessReport | null {
  if (!metadata) return null;
  try {
    const j = JSON.parse(metadata) as { type?: string; report?: PrintReadinessReport };
    if (j.type === "print_readiness_report" && j.report?.score != null) return j.report;
    return null;
  } catch {
    return null;
  }
}

function gradeColor(grade: string) {
  if (grade === "Excellent") return "from-emerald-500 to-teal-500";
  if (grade === "Good") return "from-cyan-500 to-blue-500";
  if (grade === "Average") return "from-amber-500 to-orange-500";
  if (grade === "Needs Improvement") return "from-orange-500 to-rose-500";
  return "from-rose-600 to-red-700";
}

export function PrintReadinessCard({
  report,
  dark,
  onFix,
}: {
  report: PrintReadinessReport;
  dark?: boolean;
  onFix?: (fixId: string, label: string) => void;
}) {
  const okProducts = report.suitableFor.filter((s) => s.ok).slice(0, 8);
  const noProducts = report.suitableFor.filter((s) => !s.ok).slice(0, 4);

  return (
    <div
      className={cn(
        "mt-2 overflow-hidden rounded-2xl border shadow-lg",
        dark ? "border-white/12 bg-[#0a1220]" : "border-slate-200 bg-white",
      )}
    >
      {/* Score header */}
      <div className={cn("bg-gradient-to-r p-3 text-white", gradeColor(report.grade))}>
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] uppercase opacity-90">
          <ShieldCheck className="h-3.5 w-3.5" />
          Print readiness report
        </div>
        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            <div className="text-3xl font-black leading-none">{report.score}%</div>
            <div className="mt-1 text-sm font-bold">{report.grade}</div>
          </div>
          <div className="max-w-[55%] text-right text-[11px] leading-snug opacity-95">{report.headline}</div>
        </div>
      </div>

      <div className="space-y-3 p-3">
        <p className={cn("text-[12px] leading-relaxed", dark ? "text-slate-300" : "text-slate-600")}>
          {report.friendlySummary}
        </p>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {[
            ["Resolution", report.resolution.level],
            ["Colour", report.colour.mode.split("(")[0].trim()],
            ["Format", report.format.type],
            ["Transparency", report.format.hasTransparency.slice(0, 22)],
          ].map(([k, v]) => (
            <div
              key={k}
              className={cn(
                "rounded-xl border px-2.5 py-2",
                dark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50",
              )}
            >
              <div className={cn("text-[9px] font-bold uppercase tracking-wider", dark ? "text-slate-500" : "text-slate-400")}>
                {k}
              </div>
              <div className={cn("mt-0.5 font-semibold", dark ? "text-white" : "text-slate-800")}>{v}</div>
            </div>
          ))}
        </div>

        <div className={cn("rounded-xl border px-2.5 py-2 text-[11px]", dark ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-100" : "border-cyan-100 bg-cyan-50 text-cyan-900")}>
          <span className="font-bold">Max print size: </span>
          {report.maxPrintSize}
        </div>

        {report.colour.recommendation ? (
          <div className={cn("text-[11px]", dark ? "text-slate-400" : "text-slate-500")}>
            <span className="font-semibold text-orange-400">Colour tip: </span>
            {report.colour.recommendation}
          </div>
        ) : null}

        {/* Visual zones */}
        {report.visualHints.length > 0 ? (
          <div>
            <div className={cn("mb-1 text-[10px] font-bold tracking-wider uppercase", dark ? "text-slate-500" : "text-slate-400")}>
              Visual QC zones
            </div>
            <div className="flex flex-wrap gap-1.5">
              {report.visualHints.map((h, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    h.severity === "fail"
                      ? "bg-rose-500/20 text-rose-300"
                      : h.severity === "warn"
                        ? "bg-amber-500/20 text-amber-200"
                        : dark
                          ? "bg-white/10 text-slate-300"
                          : "bg-slate-100 text-slate-600",
                  )}
                >
                  {h.zone}: {h.note}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Suitable */}
        <div>
          <div className={cn("mb-1 text-[10px] font-bold tracking-wider uppercase", dark ? "text-emerald-400/80" : "text-emerald-700")}>
            Suitable for
          </div>
          <div className="flex flex-wrap gap-1">
            {okProducts.map((s) => (
              <span
                key={s.product}
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  dark ? "bg-emerald-500/15 text-emerald-200" : "bg-emerald-50 text-emerald-800",
                )}
              >
                <CheckCircle2 className="h-3 w-3" />
                {s.product}
              </span>
            ))}
          </div>
          {noProducts.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {noProducts.map((s) => (
                <span
                  key={s.product}
                  title={s.reason}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px]",
                    dark ? "bg-rose-500/10 text-rose-300/90" : "bg-rose-50 text-rose-700",
                  )}
                >
                  ✕ {s.product}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Warnings */}
        {report.warnings.length > 0 ? (
          <div className={cn("rounded-xl border px-2.5 py-2", dark ? "border-amber-500/25 bg-amber-500/10" : "border-amber-100 bg-amber-50")}>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" /> Gentle notes
            </div>
            <ul className={cn("mt-1 space-y-0.5 text-[11px]", dark ? "text-amber-100/90" : "text-amber-900")}>
              {report.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Suggestions */}
        <div>
          <div className={cn("mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase", dark ? "text-violet-300" : "text-violet-700")}>
            <Sparkles className="h-3 w-3" /> Suggestions
          </div>
          <ul className={cn("space-y-0.5 text-[11px]", dark ? "text-slate-300" : "text-slate-600")}>
            {report.suggestions.slice(0, 5).map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>

        {/* One-click optional fixes */}
        {report.oneClickFixes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {report.oneClickFixes.map((f) => (
              <button
                key={f.id}
                type="button"
                title={f.description}
                onClick={() => onFix?.(f.id, f.label)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-bold transition",
                  dark
                    ? "border-violet-400/30 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25"
                    : "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className={cn("flex items-start gap-1.5 text-[10px]", dark ? "text-slate-500" : "text-slate-400")}>
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          Original file never modified · report version {report.version} · pre-press QC copy only
        </div>
      </div>
    </div>
  );
}
