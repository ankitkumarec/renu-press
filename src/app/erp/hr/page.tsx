import { HrManager } from "@/components/erp/HrManager";

export default function ErpHrPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">HR · Attendance · Salary</h1>
        <p className="text-sm text-slate-500">
          Staff add/delete · click pe attendance · advance/salary cash-online history
        </p>
      </div>
      <HrManager />
    </div>
  );
}
