import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ErpLeadsPage() {
  const [leads, quotes] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-black">Leads & quotes</h1>
        <p className="text-sm text-slate-500">
          Website forms land here ·{" "}
          <Link href="/erp/crm" className="text-violet-400">
            full CRM →
          </Link>
        </p>
      </div>
      <section className="rounded-2xl border border-white/10 overflow-x-auto">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-bold">Leads</div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-white/5">
                <td className="px-4 py-2.5 font-medium">{l.name}</td>
                <td className="px-4 py-2.5">{l.phone}</td>
                <td className="px-4 py-2.5 text-slate-500">{l.source}</td>
                <td className="px-4 py-2.5">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rounded-2xl border border-white/10 overflow-x-auto">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-bold">Quote requests</div>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-t border-white/5">
                <td className="px-4 py-2.5 font-medium">
                  {q.name}
                  <div className="text-xs text-slate-500">{q.phone}</div>
                </td>
                <td className="px-4 py-2.5">{q.service}</td>
                <td className="px-4 py-2.5">{q.quantity}</td>
                <td className="px-4 py-2.5">{q.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
