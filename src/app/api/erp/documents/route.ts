import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { z } from "zod";

export async function GET() {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const docs = await prisma.documentVault.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ ok: true, docs });
}

const schema = z.object({
  title: z.string().min(1),
  category: z.string().default("General"),
  fileUrl: z.string().min(1),
  fileName: z.string().optional(),
  relatedTo: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = schema.parse(await req.json());
  const doc = await prisma.documentVault.create({ data: body });
  return NextResponse.json({ ok: true, doc });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.documentVault.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
