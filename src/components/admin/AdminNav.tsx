"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/settings", label: "Site settings" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/leads", label: "Leads & quotes" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/users", label: "Users" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 text-[13px]">
      {LINKS.map((l) => {
        const active = path === l.href || (l.href !== "/admin" && path.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "block rounded-lg px-3 py-2 transition",
              active ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
