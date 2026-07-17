import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { ErpShell } from "@/components/erp/ErpShell";

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    redirect("/login?as=admin");
  }

  return (
    <ErpShell userName={session.name} role={session.role}>
      {children}
    </ErpShell>
  );
}
