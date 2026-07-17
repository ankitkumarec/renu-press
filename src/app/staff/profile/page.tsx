import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function StaffProfilePage() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { employeeProfile: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Profile</h1>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-xl font-bold">{user?.name}</div>
        <div className="mt-1 text-sm text-slate-400">{user?.email}</div>
        <div className="mt-1 text-sm text-slate-400">{user?.phone}</div>
        <div className="mt-4 grid gap-2 text-sm">
          <div>Department: {user?.employeeProfile?.department || "—"}</div>
          <div>Designation: {user?.employeeProfile?.designation || "—"}</div>
          <div>Role: {user?.role}</div>
        </div>
      </div>
    </div>
  );
}
