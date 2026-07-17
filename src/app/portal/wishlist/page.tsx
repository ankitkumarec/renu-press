import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PortalWishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.id },
    include: { product: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Favourites</h1>
      {items.map((i) => (
        <div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-bold">{i.product.name}</div>
          <div className="text-sm text-slate-500">₹{i.product.basePrice}</div>
        </div>
      ))}
      {items.length === 0 ? <p className="text-slate-500">No favourites yet.</p> : null}
    </div>
  );
}
