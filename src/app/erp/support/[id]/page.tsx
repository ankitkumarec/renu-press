import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SupportAdminActions } from "@/components/erp/SupportAdminActions";
import { ArrowLeft, Download, FileText, ImageIcon } from "lucide-react";

export default async function ErpSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conv = await prisma.supportConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      files: { where: { deleted: false }, orderBy: { createdAt: "desc" } },
      lead: true,
    },
  });
  if (!conv) notFound();

  // mark related alerts read
  await prisma.adminAlert.updateMany({
    where: { href: `/erp/support/${id}`, read: false },
    data: { read: true },
  });

  let rec: string[] = [];
  try {
    rec = JSON.parse(conv.recommendedProducts || "[]") as string[];
  } catch {
    rec = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/erp/support" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> All cases
          </Link>
          <h1 className="font-display mt-2 text-2xl font-black text-white">
            {conv.customerName || "Guest"} · {conv.product || "Inquiry"}
          </h1>
          <p className="text-sm text-slate-500">
            {conv.phone || "—"} · score {conv.leadScore} · {conv.urgency} · {conv.status}
          </p>
        </div>
        {conv.leadId ? (
          <Link href="/erp/leads" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-violet-300">
            CRM Lead linked
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Timeline */}
        <div className="xl:col-span-7 space-y-4">
          <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-4 sm:p-5">
            <h2 className="text-sm font-bold text-white">Conversation timeline</h2>
            <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {conv.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border px-3 py-2.5 text-sm ${
                    m.role === "customer"
                      ? "border-cyan-500/20 bg-cyan-500/10"
                      : m.role === "admin"
                        ? "border-amber-500/30 bg-amber-500/10"
                        : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
                    <span>{m.role}</span>
                    <span>{new Date(m.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-slate-200">{m.content}</div>
                </div>
              ))}
            </div>
          </section>

          <SupportAdminActions
            conversationId={conv.id}
            status={conv.status}
            quotePrice={conv.quotePrice}
            quoteDelivery={conv.quoteDelivery}
            quoteRemarks={conv.quoteRemarks}
          />
        </div>

        {/* Sidebar meta */}
        <div className="xl:col-span-5 space-y-4">
          <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
            <h2 className="text-sm font-bold text-white">Customer & requirement</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Name", conv.customerName],
                ["Phone", conv.phone],
                ["Email", conv.email],
                ["Business", conv.businessName],
                ["City", conv.city],
                ["Address", conv.deliveryAddress],
                ["Product", conv.product],
                ["Size", conv.size],
                ["Material", conv.material],
                ["Qty", conv.quantity],
                ["Deadline", conv.deadline],
                ["Budget note", conv.budget],
                ["Remarks", conv.remarks],
              ].map(([k, v]) => (
                <div key={k as string} className="flex gap-2 border-b border-white/5 pb-1.5">
                  <dt className="w-24 shrink-0 text-xs text-slate-500">{k}</dt>
                  <dd className="text-slate-200">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
            <h2 className="text-sm font-bold text-white">Consultant summary</h2>
            <dl className="mt-2 space-y-1.5 text-xs">
              <div className="flex gap-2">
                <dt className="w-20 text-slate-500">Intent</dt>
                <dd className="text-cyan-200">{conv.customerIntent || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 text-slate-500">Category</dt>
                <dd className="text-slate-200">{conv.interestedCategory || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 text-slate-500">Bundle</dt>
                <dd className="text-violet-200">{conv.suggestedBundle || "—"}</dd>
              </div>
            </dl>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-300">
              {conv.aiSummary || "Summary after handover."}
            </pre>
            {rec.length ? (
              <div className="mt-3">
                <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Recommended products</div>
                <ul className="mt-1 list-inside list-disc text-xs text-violet-300">
                  {rec.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0c1220] p-5">
            <h2 className="text-sm font-bold text-white">Files gallery</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {conv.files.map((f) => (
                <div key={f.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  {f.storageData && f.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a href={f.storageData} target="_blank" rel="noreferrer">
                      <img src={f.storageData} alt={f.fileName} className="h-28 w-full object-cover" />
                    </a>
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-white/5">
                      {f.mimeType === "application/pdf" ? (
                        <FileText className="h-8 w-8 text-rose-300" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-slate-500" />
                      )}
                    </div>
                  )}
                  <div className="p-2">
                    <div className="truncate text-xs font-semibold text-white">{f.fileName}</div>
                    <div className="text-[10px] text-slate-500">
                      {f.category} · {(f.sizeBytes / 1024).toFixed(0)} KB
                    </div>
                    {f.storageData ? (
                      <a
                        href={f.storageData}
                        download={f.fileName}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300"
                      >
                        <Download className="h-3 w-3" /> Download
                      </a>
                    ) : (
                      <span className="mt-1 block text-[10px] text-slate-600">Preview not stored (large file)</span>
                    )}
                    {f.analysis ? (
                      <p className="mt-1 line-clamp-3 text-[10px] text-slate-400">
                        {(() => {
                          try {
                            return (JSON.parse(f.analysis) as { summary?: string }).summary;
                          } catch {
                            return null;
                          }
                        })()}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
              {conv.files.length === 0 ? (
                <p className="col-span-2 text-xs text-slate-500">No files uploaded.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
