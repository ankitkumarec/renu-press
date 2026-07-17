import { prisma } from "@/lib/db";
import { BillGenerator } from "@/components/erp/BillGenerator";

export const dynamic = "force-dynamic";

export default async function ErpBillsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const hasWa =
    Boolean(process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN) &&
    Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">Billing · v5 Cloud Image</p>
        <h1 className="font-display text-2xl font-black">WhatsApp bill → PNG image</h1>
        <p className="mt-1 text-sm text-slate-500">
          Button se seedha <strong className="text-slate-300">image</strong> Meta Cloud API se customer pe jati hai.
          Browser me <code className="text-xs text-orange-300">api.whatsapp.com</code> page nahi khulni chahiye.
        </p>
        <p
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
            hasWa ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
          }`}
        >
          {hasWa
            ? "✓ WhatsApp Cloud API keys loaded on server"
            : "✗ WhatsApp keys missing on server — Vercel env check karo"}
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
