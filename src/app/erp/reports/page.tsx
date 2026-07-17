import { prisma } from "@/lib/db";

export default async function ErpReportsPage() {
  const [expenseSum, orderSum, invCount] = await Promise.all([
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.inventoryItem.count(),
  ]);

  const sales = orderSum._sum.total || 0;
  const expense = expenseSum._sum.amount || 0;
  const profit = sales - expense;

  const cards = [
    { label: "Sales (orders)", value: `₹${sales.toLocaleString("en-IN")}`, tone: "text-emerald-400" },
    { label: "Expenses", value: `₹${expense.toLocaleString("en-IN")}`, tone: "text-orange-300" },
    { label: "Profit snapshot", value: `₹${profit.toLocaleString("en-IN")}`, tone: profit >= 0 ? "text-cyan-300" : "text-rose-400" },
    { label: "SKU count", value: String(invCount), tone: "text-violet-300" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Reports</h1>
        <p className="text-sm text-slate-500">Sales · expense · inventory · P&L snapshot</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] text-slate-500">{c.label}</div>
            <div className={`mt-1 font-display text-xl font-black tabular-nums sm:text-2xl ${c.tone}`}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 p-6">
        <h2 className="font-bold">Export ready</h2>
        <p className="mt-2 text-sm text-slate-400">
          Excel / PDF export hooks can attach to each report. GST summary, daily closing, vendor & customer outstanding modules use the same ledger models.
        </p>
      </div>
    </div>
  );
}
