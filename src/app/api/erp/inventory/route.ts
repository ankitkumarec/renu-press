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
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    include: { supplier: true, adjustments: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  return NextResponse.json({ ok: true, items });
}

const createSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  category: z.string().default("General"),
  warehouse: z.string().default("Main"),
  unit: z.string().default("pcs"),
  quantity: z.number().default(0),
  reorderLevel: z.number().default(5),
  unitCost: z.number().default(0),
  supplierId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const body = createSchema.parse(await req.json());
    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        sku: body.sku || null,
        category: body.category,
        warehouse: body.warehouse,
        unit: body.unit,
        quantity: body.quantity,
        reorderLevel: body.reorderLevel,
        unitCost: body.unitCost,
        supplierId: body.supplierId || null,
        adjustments:
          body.quantity !== 0
            ? { create: { delta: body.quantity, reason: "Opening stock" } }
            : undefined,
      },
    });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}

const adjustSchema = z.object({
  id: z.string(),
  delta: z.number(),
  reason: z.string().default("Manual adjust"),
  unitCost: z.number().optional(),
  reorderLevel: z.number().optional(),
  name: z.string().optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const body = adjustSchema.parse(await req.json());
    const item = await prisma.inventoryItem.findUnique({ where: { id: body.id } });
    if (!item) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    const quantity = Math.max(0, item.quantity + body.delta);
    const updated = await prisma.inventoryItem.update({
      where: { id: body.id },
      data: {
        quantity,
        unitCost: body.unitCost ?? undefined,
        reorderLevel: body.reorderLevel ?? undefined,
        name: body.name ?? undefined,
        adjustments: {
          create: { delta: body.delta, reason: body.reason },
        },
      },
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, message: "id required" }, { status: 400 });
  await prisma.inventoryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
