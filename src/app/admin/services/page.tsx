import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    include: { services: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Services</h1>
          <p className="mt-1 text-sm text-zinc-500">Catalogue powered by database — add unlimited categories & services.</p>
        </div>
        <Link href="/admin/settings" className="text-xs text-amber-500">
          Site settings →
        </Link>
      </div>

      {categories.map((cat) => (
        <section key={cat.id} className="rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">
            {cat.name} <span className="text-zinc-500">· {cat.services.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[10px] tracking-wide text-zinc-500 uppercase">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Slug</th>
                  <th className="px-4 py-2">Featured</th>
                  <th className="px-4 py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {cat.services.map((s) => (
                  <tr key={s.id} className="border-t border-white/5">
                    <td className="px-4 py-2.5 font-medium">{s.name}</td>
                    <td className="px-4 py-2.5 text-zinc-500">{s.slug}</td>
                    <td className="px-4 py-2.5">{s.isFeatured ? "Yes" : "—"}</td>
                    <td className="px-4 py-2.5">{s.isActive ? "On" : "Off"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
