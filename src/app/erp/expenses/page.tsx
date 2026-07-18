import { prisma } from "@/lib/db";
import { ExpenseForm } from "@/components/erp/ExpenseForm";
import { ExpenseDeleteButton } from "@/components/erp/ExpenseDeleteButton";

export default async function ErpExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { expenseDate: "desc" },
    take: 50,
    include: { createdBy: true },
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-orange-400 uppercase">Accounting</p>
          <h1 className="font-display text-2xl font-black">Smart expenses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Proof upload · OCR auto-fill · GST · bank / UPI / cash
          </p>
        </div>
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-right">
          <div className="text-[10px] text-orange-200/80">Listed total</div>
          <div className="font-display text-xl font-black text-orange-300">₹{total.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <ExpenseForm />
        </div>
        <div className="xl:col-span-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-bold">Expense ledger</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[10px] tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Method</th>
                  <th className="px-4 py-2">Proof</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{e.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {e.vendorName || "—"} · {new Date(e.expenseDate).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{e.category}</td>
                    <td className="px-4 py-3 text-xs">{e.paymentMethod}</td>
                    <td className="px-4 py-3">
                      {e.proofUrl ? (
                        <a href={e.proofUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-cyan-400">
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-orange-300">
                      ₹{e.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <ExpenseDeleteButton id={e.id} />
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      No expenses yet — add one with proof.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
