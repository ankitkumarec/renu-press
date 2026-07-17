"use client";

import { usePathname } from "next/navigation";
import { SupportDeskWidget } from "./SupportDesk";

/** Site-wide floating desk — hidden on /support (embedded page chat). */
export function SupportFloatGate() {
  const path = usePathname();
  if (path?.startsWith("/support")) return null;
  return <SupportDeskWidget />;
}
