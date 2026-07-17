import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminLogout } from "@/components/admin/AdminLogout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.role)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh bg-[#0b0d10] text-zinc-100">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-[#0f1218] md:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <Link href="/admin" className="font-display text-sm font-semibold tracking-tight">
            RENU PRESS
          </Link>
          <p className="mt-0.5 text-[10px] tracking-[0.16em] text-zinc-500 uppercase">Control room</p>
        </div>
        <AdminNav />
        <div className="mt-auto border-t border-white/10 p-4 text-xs text-zinc-500">
          <p className="font-medium text-zinc-300">{session.name}</p>
          <p className="mt-0.5">{session.role}</p>
          <Link href="/" className="mt-3 inline-block text-amber-500/90 hover:text-amber-400">
            ← Public site
          </Link>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
          <span className="text-sm font-medium text-zinc-400 md:hidden">RENU PRESS Admin</span>
          <div className="ml-auto">
            <AdminLogout />
          </div>
        </header>
        <div className="min-w-0 flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
