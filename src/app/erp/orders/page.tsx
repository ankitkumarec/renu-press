import Link from "next/link";
import { OrdersBoard } from "@/components/erp/OrdersBoard";

export default function ErpOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">Orders</h1>
          <p className="text-sm text-slate-500">
            Phone · paid/due · cash/online · 7/14/28 day filter · PDF invoice
          </p>
        </div>
        <div className="flex gap-3 text-xs font-bold">
          <Link href="/erp/bills" className="text-emerald-400">
            + New bill →
          </Link>
          <Link href="/erp/production" className="text-violet-400">
            Kanban →
          </Link>
        </div>
      </div>
      <OrdersBoard />
    </div>
  );
}
