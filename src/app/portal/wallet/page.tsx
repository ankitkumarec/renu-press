import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PortalWalletPage() {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  const profile = await prisma.customerProfile.findUnique({ where: { userId: session.id } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Wallet & rewards</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
          <div className="text-sm opacity-90">Wallet balance</div>
          <div className="mt-1 text-3xl font-black">₹{(profile?.walletBalance || 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 p-6 text-white shadow-lg">
          <div className="text-sm opacity-90">Reward points</div>
          <div className="mt-1 text-3xl font-black">{profile?.rewardPoints || 0}</div>
        </div>
      </div>
    </div>
  );
}
