import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PortalTicketsPage() {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Support tickets</h1>
      {tickets.map((t) => (
        <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex justify-between gap-2">
            <div className="font-bold">{t.subject}</div>
            <span className="text-xs font-bold text-amber-600">{t.status}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{t.body}</p>
        </div>
      ))}
      {tickets.length === 0 ? <p className="text-slate-500">No tickets.</p> : null}
    </div>
  );
}
