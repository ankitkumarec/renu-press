import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json({ ok: false, message: "Enter order number or tracking code." }, { status: 400 });
  }
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ orderNumber: code }, { trackingCode: code }],
    },
    include: {
      statusHistory: { orderBy: { createdAt: "asc" } },
      product: true,
    },
  });
  if (!order) {
    return NextResponse.json({ ok: false, message: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    order: {
      orderNumber: order.orderNumber,
      serviceName: order.serviceName,
      status: order.status,
      paymentStatus: order.paymentStatus,
      quantity: order.quantity,
      total: order.total,
      history: order.statusHistory,
      updatedAt: order.updatedAt,
    },
  });
}
