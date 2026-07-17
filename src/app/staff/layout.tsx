import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !isStaffRole(session.role)) {
    redirect("/login?as=staff");
  }
  if (session.role === "CUSTOMER") redirect("/portal");

  return <StaffShell name={session.name}>{children}</StaffShell>;
}
