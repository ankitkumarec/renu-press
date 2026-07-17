"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Wallet,
  Users,
  Truck,
  Factory,
  Contact,
  FileStack,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/erp", label: "Dashboard", icon: LayoutDashboard },
  { href: "/erp/orders", label: "Orders", icon: ShoppingCart },
  { href: "/erp/production", label: "Production", icon: Factory },
  { href: "/erp/inventory", label: "Inventory", icon: Package },
  { href: "/erp/expenses", label: "Expenses", icon: Wallet },
  { href: "/erp/bills", label: "WhatsApp Bills", icon: FileStack },
  { href: "/erp/purchase", label: "Purchase", icon: Truck },
  { href: "/erp/suppliers", label: "Suppliers", icon: Building2 },
  { href: "/erp/crm", label: "CRM", icon: Contact },
  { href: "/erp/hr", label: "HR & Salary", icon: Users },
  { href: "/erp/reports", label: "Reports", icon: BarChart3 },
  { href: "/erp/documents", label: "Documents", icon: FileStack },
  { href: "/erp/leads", label: "Leads", icon: ClipboardList },
  { href: "/erp/settings", label: "Settings", icon: Settings },
];

export function ErpShell({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[#070b14] text-slate-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0c1220] transition md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-black">
            ERP
          </div>
          <div>
            <div className="text-sm font-bold">RENU PRESS</div>
            <div className="text-[10px] tracking-widest text-violet-300/80 uppercase">Enterprise</div>
          </div>
          <button type="button" className="ml-auto md:hidden" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 text-[13px]">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== "/erp" && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition",
                  active
                    ? "bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 text-white shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs text-slate-500">
          <div className="font-semibold text-slate-300">{userName}</div>
          <div>{role}</div>
          <Link href="/" className="mt-2 block text-violet-400 hover:text-violet-300">
            Public site →
          </Link>
        </div>
      </aside>

      {open && <button type="button" className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#070b14]/90 px-3 py-3 backdrop-blur sm:px-5">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCmd(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-sm text-slate-500 sm:max-w-md"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Search orders, expenses, stock…</span>
            <kbd className="ml-auto hidden rounded border border-white/10 px-1.5 text-[10px] sm:inline">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login?as=admin");
              router.refresh();
            }}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-white"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        <div className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 md:p-6">{children}</div>
      </div>

      {cmd && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 p-4 pt-[15vh]" onClick={() => setCmd(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#121826] p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input autoFocus placeholder="Jump to…" className="w-full bg-transparent py-2 text-sm outline-none" onKeyDown={(e) => e.key === "Escape" && setCmd(false)} />
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setCmd(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
