import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  if (["EMPLOYEE", "DESIGNER"].includes(session.role)) redirect("/staff");
  // Admin can still peek portal

  return <PortalShell name={session.name}>{children}</PortalShell>;
}
