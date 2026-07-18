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
  const pos = await prisma.purchaseOrder.findMany({
    orderBy: { orderedAt: "desc" },
    include: { supplier: true },
    take: 100,
  });
  return NextResponse.json({ ok: true, pos });
}

const schema = z.object({
  supplierId: z.string(),
  total: z.number().positive(),
  notes: z.string().optional(),
  method: z.string().default("CREDIT"),
  /** if true also add supplier ledger + optional stock note */
  createLedger: z.boolean().default(true),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = schema.parse(await req.json());
  const poNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const unpaid = body.method === "CREDIT" || body.method === "DUE";

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      supplierId: body.supplierId,
      total: body.total,
      status: unpaid ? "RECEIVED_UNPAID" : "RECEIVED",
      notes: body.notes || null,
      receivedAt: new Date(),
    },
    include: { supplier: true },
  });

  if (body.createLedger) {
    await prisma.supplierLedger.create({
      data: {
        supplierId: body.supplierId,
        type: "PURCHASE",
        amount: body.total,
        method: body.method,
        note: body.notes || poNumber,
      },
    });
    // Agar cash/online pe full payment sath me
    if (!unpaid) {
      await prisma.supplierLedger.create({
        data: {
          supplierId: body.supplierId,
          type: "PAYMENT",
          amount: body.total,
          method: body.method,
          note: `Paid with ${poNumber}`,
        },
      });
    }
  }

  return NextResponse.json({ ok: true, po });
}
