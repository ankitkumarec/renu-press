import { InventoryManager } from "@/components/erp/InventoryManager";

export default function ErpInventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">Warehouse</p>
        <h1 className="font-display text-2xl font-black">Inventory ERP</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add stock · update · bill pe use hote hi auto minus (WhatsApp Bills se link)
        </p>
      </div>
      <InventoryManager />
    </div>
  );
}
