import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PortalNotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login?as=customer");
  const notes = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Notifications</h1>
      {notes.map((n) => (
        <div key={n.id} className={`rounded-2xl border p-4 ${n.read ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`}>
          <div className="font-bold">{n.title}</div>
          <p className="text-sm text-slate-600">{n.body}</p>
        </div>
      ))}
      {notes.length === 0 ? <p className="text-slate-500">You&apos;re all caught up.</p> : null}
    </div>
  );
}
