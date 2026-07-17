import { prisma } from "@/lib/db";

export default async function ErpCrmPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: "desc" },
    take: 40,
    include: { crmNotes: { orderBy: { createdAt: "desc" }, take: 2 } },
  });

  const pipeline = ["new", "contacted", "quoted", "won", "lost"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">CRM</h1>
        <p className="text-sm text-slate-500">Leads · follow-ups · notes · history</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {pipeline.map((s) => (
          <div key={s} className="min-w-[7rem] rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-500">{s}</div>
            <div className="font-display text-xl font-black">{leads.filter((l) => l.status === s).length}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {leads.map((l) => (
          <article key={l.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold">{l.name}</h3>
                <p className="text-xs text-slate-500">
                  {l.phone} · {l.service || l.source}
                </p>
              </div>
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">{l.status}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">{l.message}</p>
            {l.crmNotes[0] ? (
              <p className="mt-2 border-t border-white/5 pt-2 text-[11px] text-cyan-400/90">
                Last note: {l.crmNotes[0].body}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
