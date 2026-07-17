import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PortalAddressesPage() {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  const addresses = await prisma.address.findMany({ where: { userId: session.id } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Saved addresses</h1>
      {addresses.map((a) => (
        <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <div className="font-bold">{a.label}</div>
          <p className="mt-1 text-slate-600">
            {a.line1}
            {a.line2 ? `, ${a.line2}` : ""}
            <br />
            {a.city}, {a.state} {a.pincode}
          </p>
        </div>
      ))}
      {addresses.length === 0 ? <p className="text-slate-500">No saved addresses.</p> : null}
    </div>
  );
}
