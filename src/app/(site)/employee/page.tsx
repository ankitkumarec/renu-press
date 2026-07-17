import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EmployeePage() {
  const session = await getSession();
  if (!session || !["EMPLOYEE", "DESIGNER", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(session.role)) {
    redirect("/login");
  }

  const assigned = await prisma.order.findMany({
    where: { assignedToId: session.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-rp py-14">
        <h1 className="font-display text-3xl font-semibold">Employee panel</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Tasks · attendance · production (module foundation)</p>
        <section className="mt-8 rounded-2xl border border-[var(--color-line)] bg-white p-6">
          <h2 className="font-semibold">Assigned orders</h2>
          {assigned.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-muted)]">No assignments yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {assigned.map((o) => (
                <li key={o.id} className="flex justify-between border-b border-[var(--color-line)] py-2">
                  <span>{o.orderNumber}</span>
                  <span>{o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
