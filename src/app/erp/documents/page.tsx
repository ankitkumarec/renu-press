import { prisma } from "@/lib/db";
import { FileStack } from "lucide-react";

export default async function ErpDocumentsPage() {
  const docs = await prisma.documentVault.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Document vault</h1>
        <p className="text-sm text-slate-500">GST · bills · salary slips · warranties · agreements</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <a
            key={d.id}
            href={d.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-violet-500/40"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
              <FileStack className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{d.title}</div>
              <div className="text-xs text-slate-500">
                {d.category} · {d.fileName || "file"}
              </div>
            </div>
          </a>
        ))}
        {docs.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/15 py-12 text-center text-slate-500">
            Vault empty — upload GST, PAN, warranties from ERP.
          </div>
        ) : null}
      </div>
    </div>
  );
}
