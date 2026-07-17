import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.role)) redirect("/admin");

  const orders = await prisma.order.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-rp py-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Hello, {session.name}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Customer dashboard</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Orders", String(orders.length)],
            ["Quotes", "—"],
            ["Support", "Open ticket"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
              <div className="text-xs text-[var(--color-muted)]">{l}</div>
              <div className="mt-1 text-xl font-semibold">{v}</div>
            </div>
          ))}
        </div>
        <section className="mt-10">
          <h2 className="font-semibold">Order history</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              No orders yet.{" "}
              <Link href="/quote" className="font-semibold underline">
                Request a quote
              </Link>
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-white">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className="font-medium">{o.orderNumber}</span>
                  <span>{o.serviceName}</span>
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
