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
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: {
      ledger: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { items: true, purchases: true } },
    },
  });
  const withBalance = suppliers.map((s) => {
    let purchase = 0;
    let paid = 0;
    for (const l of s.ledger) {
      if (l.type === "PURCHASE") purchase += l.amount;
      if (l.type === "PAYMENT") paid += l.amount;
    }
    return { ...s, totalPurchase: purchase, totalPaid: paid, due: purchase - paid };
  });
  return NextResponse.json({ ok: true, suppliers: withBalance });
}

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  gst: z.string().optional(),
  address: z.string().optional(),
  products: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = createSchema.parse(await req.json());
  const supplier = await prisma.supplier.create({ data: body });
  return NextResponse.json({ ok: true, supplier });
}

const ledgerSchema = z.object({
  supplierId: z.string(),
  type: z.enum(["PURCHASE", "PAYMENT", "ADJUST"]),
  amount: z.number().positive(),
  method: z.string().default("CASH"),
  note: z.string().optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = ledgerSchema.parse(await req.json());
  const entry = await prisma.supplierLedger.create({ data: body });
  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.supplier.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
