"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Wallet,
  Bell,
  MessageSquare,
  MapPin,
  Heart,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/orders", label: "Orders", icon: Package },
  { href: "/portal/invoices", label: "Invoices", icon: FileText },
  { href: "/portal/quotes", label: "Quotes", icon: Sparkles },
  { href: "/portal/wallet", label: "Wallet", icon: Wallet },
  { href: "/portal/tickets", label: "Support", icon: MessageSquare },
  { href: "/portal/addresses", label: "Addresses", icon: MapPin },
  { href: "/portal/wishlist", label: "Favourites", icon: Heart },
  { href: "/portal/notifications", label: "Alerts", icon: Bell },
];

export function PortalShell({ children, name }: { children: React.ReactNode; name: string }) {
  const path = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#f0f4f8] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-5">
          <Link href="/portal" className="flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white">
              CP
            </span>
            <span className="hidden sm:inline">Customer Portal</span>
          </Link>
          <div className="text-sm text-slate-500">
            Hi, <span className="font-semibold text-slate-800">{name}</span>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-500"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login?as=customer");
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 sm:px-5">
          {NAV.map((n) => {
            const active = path === n.href || (n.href !== "/portal" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
                  active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600",
                )}
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-5">{children}</main>
    </div>
  );
}
