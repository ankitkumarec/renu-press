import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PortalQuotesPage() {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  const quotes = await prisma.quote.findMany({
    where: { OR: [{ userId: session.id }, { email: session.email || undefined }] },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Your quotes</h1>
        <Link href="/quote" className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white">
          New quote
        </Link>
      </div>
      {quotes.map((q) => (
        <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-bold">{q.service}</div>
          <div className="text-sm text-slate-500">
            Qty {q.quantity} · {q.status}
            {q.estimate != null ? ` · est ₹${q.estimate}` : ""}
          </div>
        </div>
      ))}
      {quotes.length === 0 ? <p className="text-slate-500">No quotes yet.</p> : null}
    </div>
  );
}
