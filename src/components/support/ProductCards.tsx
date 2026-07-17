"use client";

import Link from "next/link";
import { ExternalLink, Package, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  useCase: string;
  material: string;
  advantages: string[];
  suggestedQty: string;
  image: string;
  why: string;
  related?: string[];
};

export type CardPortfolio = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
};

export type RecPayload = {
  type?: string;
  interestedCategory?: string;
  suggestedBundle?: string | null;
  products?: CardProduct[];
  portfolio?: CardPortfolio[];
  designTips?: string[];
};

export function parseRecMetadata(metadata?: string | null): RecPayload | null {
  if (!metadata) return null;
  try {
    const j = JSON.parse(metadata) as RecPayload;
    if (j.type === "product_recommendations" && j.products?.length) return j;
    return null;
  } catch {
    return null;
  }
}

export function ProductCards({
  data,
  dark,
  onSelect,
}: {
  data: RecPayload;
  dark?: boolean;
  onSelect?: (productName: string) => void;
}) {
  const products = data.products || [];
  const portfolio = data.portfolio || [];

  return (
    <div className="mt-2 space-y-3">
      {data.suggestedBundle ? (
        <div
          className={cn(
            "rounded-xl border px-3 py-2 text-xs font-semibold",
            dark ? "border-violet-400/30 bg-violet-500/15 text-violet-100" : "border-violet-200 bg-violet-50 text-violet-800",
          )}
        >
          📦 Package: {data.suggestedBundle}
          {data.interestedCategory ? (
            <span className="mt-0.5 block font-normal opacity-80">{data.interestedCategory}</span>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2.5">
        {products.map((p) => (
          <div
            key={p.id}
            className={cn(
              "overflow-hidden rounded-xl border shadow-sm",
              dark ? "border-white/10 bg-black/25" : "border-slate-200 bg-white",
            )}
          >
            <div className="flex gap-0 sm:gap-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                className="h-full min-h-[7.5rem] w-24 shrink-0 object-cover sm:w-28"
              />
              <div className="min-w-0 flex-1 p-2.5">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className={cn("text-[10px] font-bold tracking-wider uppercase", dark ? "text-orange-300/90" : "text-orange-600")}>
                      {p.category}
                    </div>
                    <div className={cn("text-sm font-bold leading-tight", dark ? "text-white" : "text-slate-900")}>
                      {p.name}
                    </div>
                  </div>
                  <Package className={cn("h-4 w-4 shrink-0", dark ? "text-violet-300" : "text-violet-500")} />
                </div>
                <p className={cn("mt-1 text-[11px] leading-snug", dark ? "text-slate-300" : "text-slate-600")}>
                  {p.why}
                </p>
                <div className={cn("mt-1.5 space-y-0.5 text-[10px]", dark ? "text-slate-400" : "text-slate-500")}>
                  <div>
                    <span className="font-semibold">Use:</span> {p.useCase}
                  </div>
                  <div>
                    <span className="font-semibold">Material:</span> {p.material}
                  </div>
                  <div>
                    <span className="font-semibold">Qty hint:</span> {p.suggestedQty}
                  </div>
                  {p.advantages?.[0] ? (
                    <div>
                      <span className="font-semibold">Plus:</span> {p.advantages.slice(0, 2).join(" · ")}
                    </div>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelect?.(p.name)}
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-bold text-white"
                  >
                    <Quote className="h-3 w-3" /> Request quote
                  </button>
                  {p.related?.[0] ? (
                    <span className={cn("rounded-full px-2 py-1 text-[10px]", dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600")}>
                      Related: {p.related[0]}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {portfolio.length > 0 ? (
        <div>
          <div className={cn("mb-1.5 text-[10px] font-bold tracking-wider uppercase", dark ? "text-cyan-300/90" : "text-cyan-700")}>
            Similar portfolio
          </div>
          <div className="grid grid-cols-2 gap-2">
            {portfolio.map((item) => (
              <Link
                key={item.id}
                href="/portfolio"
                className={cn(
                  "group overflow-hidden rounded-lg border",
                  dark ? "border-white/10" : "border-slate-200",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title} className="h-16 w-full object-cover transition group-hover:scale-105" />
                <div className={cn("p-1.5 text-[10px] font-semibold leading-tight", dark ? "text-slate-200" : "text-slate-700")}>
                  {item.title}
                  <span className="mt-0.5 flex items-center gap-0.5 font-normal opacity-70">
                    Portfolio <ExternalLink className="h-2.5 w-2.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onSelect?.("full package")}
        className={cn(
          "w-full rounded-xl border py-2 text-xs font-bold",
          dark
            ? "border-orange-400/40 bg-orange-500/15 text-orange-100 hover:bg-orange-500/25"
            : "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100",
        )}
      >
        Interested in full package → continue
      </button>
    </div>
  );
}
