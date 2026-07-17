import { getSettings } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <div className="min-h-dvh max-w-[100vw] overflow-x-hidden bg-[#070d1a] text-slate-100">
      <Header businessName={settings.businessName} phone={settings.phone} />
      <main className="pb-20 sm:pb-8">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloat whatsapp={settings.whatsapp} />
    </div>
  );
}
