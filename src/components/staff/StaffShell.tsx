"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Banknote,
  Bell,
  User,
  LogOut,
  Factory,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/staff", label: "Today", icon: LayoutDashboard },
  { href: "/staff/jobs", label: "My jobs", icon: Briefcase },
  { href: "/staff/queue", label: "Queue", icon: Factory },
  { href: "/staff/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/staff/salary", label: "Salary", icon: Banknote },
  { href: "/staff/leaves", label: "Leaves", icon: CalendarCheck },
  { href: "/staff/profile", label: "Profile", icon: User },
];

export function StaffShell({ children, name }: { children: React.ReactNode; name: string }) {
  const path = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#111827] text-slate-100">
      <header className="border-b border-amber-500/20 bg-[#0c1018]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-black">
              ST
            </span>
            <div>
              <div className="text-sm font-bold">Staff floor</div>
              <div className="text-[10px] text-amber-400/80">{name}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login?as=staff");
            }}
            className="rounded-full border border-white/10 p-2"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 sm:px-5">
          {NAV.map((n) => {
            const active = path === n.href || (n.href !== "/staff" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold",
                  active ? "bg-amber-500 text-black" : "bg-white/5 text-slate-400",
                )}
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-5">{children}</main>
    </div>
  );
}
