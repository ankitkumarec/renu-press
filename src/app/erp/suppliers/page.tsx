import { SuppliersManager } from "@/components/erp/SuppliersManager";

export default function ErpSuppliersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Suppliers</h1>
        <p className="text-sm text-slate-500">Name · phone · products · kitna diya · kitna due</p>
      </div>
      <SuppliersManager />
    </div>
  );
}
