import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

async function saveSettings(formData: FormData) {
  "use server";
  const session = await requireRole(["SUPER_ADMIN", "ADMIN", "MANAGER"]);
  if (!session) redirect("/login");

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
      mapsLink: str("mapsLink"),
      heroTitle: str("heroTitle"),
      heroSubtitle: str("heroSubtitle"),
      aboutTitle: str("aboutTitle"),
      aboutBody: str("aboutBody"),
      storyBody: str("storyBody"),
      seoTitle: str("seoTitle"),
      seoDescription: str("seoDescription"),
      facebook: str("facebook"),
      instagram: str("instagram"),
      youtube: str("youtube"),
      gaId: str("gaId"),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!s) return <p>Settings missing. Run seed.</p>;

  const input =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-600/50";
  const label = "block text-xs font-medium text-zinc-500";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Site settings</h1>
        <p className="mt-1 text-sm text-zinc-500">All public contact & hero copy — editable here.</p>
      </div>
      <form action={saveSettings} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Business name
            <input name="businessName" defaultValue={s.businessName} className={input} />
          </label>
          <label className={label}>
            Tagline
            <input name="tagline" defaultValue={s.tagline} className={input} />
          </label>
          <label className={label}>
            Experience (years)
            <input name="experienceYears" type="number" defaultValue={s.experienceYears} className={input} />
          </label>
          <label className={label}>
            Phone
            <input name="phone" defaultValue={s.phone} className={input} />
          </label>
          <label className={label}>
            WhatsApp (country code, no +)
            <input name="whatsapp" defaultValue={s.whatsapp} className={input} />
          </label>
          <label className={label}>
            Email
            <input name="email" defaultValue={s.email} className={input} />
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
            Business hours
            <input name="businessHours" defaultValue={s.businessHours} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Google Maps embed URL
            <input name="mapsEmbedUrl" defaultValue={s.mapsEmbedUrl} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Maps link
            <input name="mapsLink" defaultValue={s.mapsLink} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Hero title
            <input name="heroTitle" defaultValue={s.heroTitle} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Hero subtitle
            <textarea name="heroSubtitle" rows={3} defaultValue={s.heroSubtitle} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            About title
            <input name="aboutTitle" defaultValue={s.aboutTitle} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            About body
            <textarea name="aboutBody" rows={4} defaultValue={s.aboutBody} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Story body
            <textarea name="storyBody" rows={4} defaultValue={s.storyBody} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            SEO title
            <input name="seoTitle" defaultValue={s.seoTitle} className={input} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            SEO description
            <textarea name="seoDescription" rows={2} defaultValue={s.seoDescription} className={input} />
          </label>
          <label className={label}>
            Facebook
            <input name="facebook" defaultValue={s.facebook} className={input} />
          </label>
          <label className={label}>
            Instagram
            <input name="instagram" defaultValue={s.instagram} className={input} />
          </label>
          <label className={label}>
            YouTube
            <input name="youtube" defaultValue={s.youtube} className={input} />
          </label>
          <label className={label}>
            GA ID
            <input name="gaId" defaultValue={s.gaId} className={input} />
          </label>
        </div>
        <button type="submit" className="rounded-full bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
          Save settings
        </button>
      </form>
    </div>
  );
}
