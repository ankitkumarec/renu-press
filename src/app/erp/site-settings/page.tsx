import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

async function saveSettings(formData: FormData) {
  "use server";
  const session = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (!session) redirect("/login?as=admin");
  const str = (k: string) => String(formData.get(k) ?? "");
  const num = (k: string) => Number(formData.get(k) || 0);
  await prisma.siteSettings.update({
    where: { id: "main" },
    data: {
      businessName: str("businessName"),
      tagline: str("tagline"),
      experienceYears: num("experienceYears"),
      phone: str("phone"),
      whatsapp: str("whatsapp"),
      email: str("email"),
      address: str("address"),
      city: str("city"),
      state: str("state"),
      pincode: str("pincode"),
      gst: str("gst"),
      businessHours: str("businessHours"),
      mapsEmbedUrl: str("mapsEmbedUrl"),
      heroTitle: str("heroTitle"),
      heroSubtitle: str("heroSubtitle"),
      aboutTitle: str("aboutTitle"),
      aboutBody: str("aboutBody"),
      seoTitle: str("seoTitle"),
      seoDescription: str("seoDescription"),
    },
  });
  revalidatePath("/");
  revalidatePath("/erp/site-settings");
}

export default async function ErpSiteSettingsPage() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!s) return <p>Run seed.</p>;
  const input =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/40";
  const label = "block text-xs font-bold text-slate-500";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black">Website CMS</h1>
        <p className="text-sm text-slate-500">Public site content — separate from ERP ops</p>
      </div>
      <form action={saveSettings} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Business name
            <input name="businessName" defaultValue={s.businessName} className={input} />
          </label>
          <label className={label}>
            Tagline
            <input name="tagline" defaultValue={s.tagline} className={input} />
          </label>
          <label className={label}>
            Phone
            <input name="phone" defaultValue={s.phone} className={input} />
          </label>
          <label className={label}>
            WhatsApp
            <input name="whatsapp" defaultValue={s.whatsapp} className={input} />
          </label>
          <label className={label}>
            Email
            <input name="email" defaultValue={s.email} className={input} />
          </label>
          <label className={label}>
            Experience years
            <input name="experienceYears" type="number" defaultValue={s.experienceYears} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Address
            <input name="address" defaultValue={s.address} className={input} />
          </label>
          <label className={label}>
            City
            <input name="city" defaultValue={s.city} className={input} />
          </label>
          <label className={label}>
            State
            <input name="state" defaultValue={s.state} className={input} />
          </label>
          <label className={label}>
            Pincode
            <input name="pincode" defaultValue={s.pincode} className={input} />
          </label>
          <label className={label}>
            GST
            <input name="gst" defaultValue={s.gst} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Hours
            <input name="businessHours" defaultValue={s.businessHours} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Maps embed
            <input name="mapsEmbedUrl" defaultValue={s.mapsEmbedUrl} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Hero title
            <input name="heroTitle" defaultValue={s.heroTitle} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Hero subtitle
            <textarea name="heroSubtitle" rows={2} defaultValue={s.heroSubtitle} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            About title
            <input name="aboutTitle" defaultValue={s.aboutTitle} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            About body
            <textarea name="aboutBody" rows={3} defaultValue={s.aboutBody} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            SEO title
            <input name="seoTitle" defaultValue={s.seoTitle} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            SEO description
            <textarea name="seoDescription" rows={2} defaultValue={s.seoDescription} className={input} />
          </label>
        </div>
        <button type="submit" className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white">
          Save website settings
        </button>
      </form>
    </div>
  );
}
