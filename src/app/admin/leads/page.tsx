import { prisma } from "@/lib/db";

export default async function AdminLeadsPage() {
  const [leads, quotes] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Leads & quotes</h1>
        <p className="mt-1 text-sm text-zinc-500">CRM inbox from website forms.</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Leads</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[10px] text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="px-4 py-2.5 font-medium">{l.name}</td>
                  <td className="px-4 py-2.5">{l.phone}</td>
                  <td className="px-4 py-2.5 text-zinc-500">{l.source}</td>
                  <td className="max-w-xs truncate px-4 py-2.5 text-zinc-400">{l.message}</td>
                  <td className="px-4 py-2.5">{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Quote requests</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-[10px] text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Size</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-t border-white/5">
                  <td className="px-4 py-2.5 font-medium">{q.name}</td>
                  <td className="px-4 py-2.5">{q.phone}</td>
                  <td className="px-4 py-2.5">{q.service}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{q.size || "—"}</td>
                  <td className="px-4 py-2.5">{q.quantity}</td>
                  <td className="px-4 py-2.5">{q.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
