import { prisma } from "@/lib/db";
import { BillGenerator } from "@/components/erp/BillGenerator";

export default async function ErpBillsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Billing</p>
        <h1 className="font-display text-2xl font-black">WhatsApp bill generator</h1>
        <p className="mt-1 text-sm text-slate-500">
          Customer name + WhatsApp + items → PNG bill + WhatsApp message. Bill number aap set karte ho.
        </p>
      </div>
      <BillGenerator
        businessName={settings?.businessName || "RENU PRESS"}
        address={settings?.address || "Saharsa, Bihar"}
        phone={settings?.phone || ""}
      />
    </div>
  );
}
