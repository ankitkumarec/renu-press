import { PurchaseManager } from "@/components/erp/PurchaseManager";

export default function ErpPurchasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Purchase orders</h1>
        <p className="text-sm text-slate-500">
          Maal aaya · credit / cash / online · supplier se linked · list yahin
        </p>
      </div>
      <PurchaseManager />
    </div>
  );
}
