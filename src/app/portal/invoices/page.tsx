import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PortalInvoicesPage() {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  const invoices = await prisma.invoice.findMany({
    where: { order: { customerId: session.id } },
    include: { order: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Invoices</h1>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-slate-500">{inv.order.orderNumber}</td>
                <td className="px-4 py-3 text-right font-bold">₹{inv.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  No invoices yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
