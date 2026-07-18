import { LeadsManager } from "@/components/erp/LeadsManager";

export default function ErpLeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Leads & quotes</h1>
        <p className="text-sm text-slate-500">Add · status · call/WA · convert to order</p>
      </div>
      <LeadsManager />
    </div>
  );
}
