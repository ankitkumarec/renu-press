import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { z } from "zod";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") || 0);
  const where =
    days > 0
      ? { createdAt: { gte: new Date(Date.now() - days * 864e5) } }
      : {};
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: true, payments: true },
  });
  return NextResponse.json({ ok: true, orders });
}

const createSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  serviceName: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  subtotal: z.number(),
  tax: z.number().default(0),
  total: z.number(),
  discount: z.number().default(0),
  discountType: z.string().default("FLAT"),
  gstPct: z.number().default(18),
  paidAmount: z.number().default(0),
  paymentMethod: z.string().default("CASH"),
  billNo: z.string().optional(),
  itemsJson: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  /// optional inventory deductions [{ itemId, qty }]
  stockDeductions: z
    .array(z.object({ itemId: z.string(), qty: z.number().positive() }))
    .optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = createSchema.parse(await req.json());
    const phone = (body.customerPhone || "").replace(/\D/g, "");

    // Find or create customer user by phone / walk-in
    let customer = phone
      ? await prisma.user.findFirst({ where: { phone: { contains: phone.slice(-10) } } })
      : null;
    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: body.customerName,
          phone: phone || null,
          role: "CUSTOMER",
          email: phone ? `walkin_${phone}@renupress.local` : `walkin_${Date.now()}@renupress.local`,
        },
      });
    } else if (customer.name === "Demo Customer" || !customer.name) {
      await prisma.user.update({
        where: { id: customer.id },
        data: { name: body.customerName },
      });
    }

    const paid = Math.min(body.paidAmount, body.total);
    const due = Math.max(0, Math.round((body.total - paid) * 100) / 100);
    const paymentStatus =
      paid <= 0 ? "UNPAID" : due <= 0 ? "PAID" : "PARTIAL";

    const orderNumber =
      body.billNo ||
      `RP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        serviceName: body.serviceName,
        quantity: body.quantity,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
        advancePaid: paid,
        customerPhone: phone || null,
        paymentMethod: body.paymentMethod,
        paidAmount: paid,
        dueAmount: due,
        discount: body.discount,
        discountType: body.discountType,
        gstPct: body.gstPct,
        billNo: body.billNo || orderNumber,
        itemsJson: body.itemsJson || null,
        notes: body.notes || null,
        status: body.status || "CONFIRMED",
        paymentStatus,
        statusHistory: {
          create: { status: body.status || "CONFIRMED", note: "Created from bill / ERP" },
        },
        payments:
          paid > 0
            ? {
                create: {
                  amount: paid,
                  method: body.paymentMethod,
                  status: "success",
                },
              }
            : undefined,
        stages: {
          create: [
            { stage: "DESIGN", sortOrder: 0, status: "PENDING" },
            { stage: "PRINTING", sortOrder: 1, status: "PENDING" },
            { stage: "FINISHING", sortOrder: 2, status: "PENDING" },
            { stage: "DELIVERY", sortOrder: 3, status: "PENDING" },
          ],
        },
      },
    });

    // Auto stock deduct
    if (body.stockDeductions?.length) {
      for (const d of body.stockDeductions) {
        const item = await prisma.inventoryItem.findUnique({ where: { id: d.itemId } });
        if (!item) continue;
        const next = Math.max(0, item.quantity - d.qty);
        await prisma.inventoryItem.update({
          where: { id: d.itemId },
          data: { quantity: next },
        });
        await prisma.stockAdjustment.create({
          data: {
            itemId: d.itemId,
            delta: -d.qty,
            reason: `Bill/Order ${order.orderNumber}`,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "ORDER_CREATE",
        entity: "Order",
        meta: JSON.stringify({ id: order.id, total: order.total }),
      },
    });

    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}

const patchSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  paidAmount: z.number().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const body = patchSchema.parse(await req.json());
    const existing = await prisma.order.findUnique({ where: { id: body.id } });
    if (!existing) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    let paidAmount = existing.paidAmount;
    let dueAmount = existing.dueAmount;
    let paymentStatus = existing.paymentStatus;
    if (body.paidAmount != null) {
      paidAmount = body.paidAmount;
      dueAmount = Math.max(0, existing.total - paidAmount);
      paymentStatus = paidAmount <= 0 ? "UNPAID" : dueAmount <= 0 ? "PAID" : "PARTIAL";
    }
    if (body.paymentStatus) paymentStatus = body.paymentStatus;

    const order = await prisma.order.update({
      where: { id: body.id },
      data: {
        status: body.status ?? undefined,
        paidAmount,
        dueAmount,
        paymentStatus,
        paymentMethod: body.paymentMethod ?? undefined,
        notes: body.notes ?? undefined,
        advancePaid: paidAmount,
        ...(body.status
          ? { statusHistory: { create: { status: body.status, note: "Status update" } } }
          : {}),
      },
    });
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}
