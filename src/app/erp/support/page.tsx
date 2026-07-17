import Link from "next/link";
import { prisma } from "@/lib/db";
import { Headphones, Paperclip, MessageSquare } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  NEW_INQUIRY: "bg-slate-500/20 text-slate-300",
  REQUIREMENT_COLLECTED: "bg-blue-500/20 text-blue-300",
  QUALIFIED: "bg-cyan-500/20 text-cyan-300",
  WAITING_REVIEW: "bg-amber-500/20 text-amber-300",
  QUOTE_PENDING: "bg-orange-500/20 text-orange-300",
  QUOTE_SENT: "bg-violet-500/20 text-violet-300",
  NEGOTIATION: "bg-fuchsia-500/20 text-fuchsia-300",
  CONFIRMED: "bg-emerald-500/20 text-emerald-300",
  PRODUCTION: "bg-teal-500/20 text-teal-300",
  COMPLETED: "bg-green-500/20 text-green-300",
  LOST: "bg-rose-500/20 text-rose-300",
};

export default async function ErpSupportListPage() {
  const [conversations, alerts] = await Promise.all([
    prisma.supportConversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 80,
      include: { _count: { select: { messages: true, files: true } } },
    }),
    prisma.adminAlert.findMany({
      where: { read: false, type: "SUPPORT_LEAD" },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-violet-300">
            <Headphones className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Digital Support Desk</span>
          </div>
          <h1 className="font-display mt-1 text-2xl font-black text-white">Support inbox</h1>
          <p className="text-sm text-slate-500">
            Customer chats, files, lead score · quotation yahin se approve karein
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
          <span className="text-slate-400">Open cases </span>
          <span className="font-bold text-white">{conversations.filter((c) => c.isOpen).length}</span>
        </div>
      </div>

      {alerts.length > 0 ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-xs font-bold tracking-wider text-amber-300 uppercase">New alerts</div>
          <ul className="mt-2 space-y-2">
            {alerts.map((a) => (
              <li key={a.id}>
                <Link href={a.href || "/erp/support"} className="block rounded-lg px-2 py-1.5 hover:bg-white/5">
                  <div className="text-sm font-semibold text-white">{a.title}</div>
                  <div className="text-xs text-amber-100/80">{a.body}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Intent / Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{c.customerName || "— Guest —"}</div>
                    <div className="text-xs text-slate-500">{c.phone || "No phone yet"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{c.product || "—"}</div>
                    {c.customerIntent ? (
                      <div className="text-[10px] text-cyan-400/90">{c.customerIntent}</div>
                    ) : null}
                    {c.suggestedBundle ? (
                      <div className="text-[10px] text-violet-400/80">{c.suggestedBundle}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[c.status] || "bg-white/10 text-slate-300"}`}
                    >
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.urgency === "urgent"
                          ? "font-bold text-rose-400"
                          : c.urgency === "high"
                            ? "text-amber-300"
                            : "text-slate-400"
                      }
                    >
                      {c.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-violet-300">{c.leadScore}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {c._count.messages}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Paperclip className="h-3.5 w-3.5" />
                        {c._count.files}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/erp/support/${c.id}`}
                      className="rounded-full bg-violet-600/20 px-3 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-600/30"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {conversations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No support conversations yet. Customers use site Support Desk widget.
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
