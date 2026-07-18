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
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ ok: true, leads });
}

const patchSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  notes: z.string().optional(),
  convertToOrder: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = patchSchema.parse(await req.json());
  const lead = await prisma.lead.update({
    where: { id: body.id },
    data: {
      status: body.status ?? undefined,
      notes: body.notes ?? undefined,
    },
  });

  if (body.convertToOrder) {
    let customer = await prisma.user.findFirst({
      where: { phone: { contains: lead.phone.replace(/\D/g, "").slice(-10) } },
    });
    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: lead.name,
          phone: lead.phone,
          role: "CUSTOMER",
          email: `lead_${Date.now()}@renupress.local`,
        },
      });
    }
    const order = await prisma.order.create({
      data: {
        orderNumber: `RP-L-${Date.now().toString().slice(-8)}`,
        customerId: customer.id,
        customerPhone: lead.phone,
        serviceName: lead.service || lead.message.slice(0, 80) || "Lead order",
        notes: lead.message,
        status: "PENDING",
        paymentStatus: "UNPAID",
        total: 0,
        statusHistory: { create: { status: "PENDING", note: "From lead" } },
      },
    });
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "won" },
    });
    return NextResponse.json({ ok: true, lead, order });
  }

  return NextResponse.json({ ok: true, lead });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = z
    .object({
      name: z.string().min(1),
      phone: z.string().min(8),
      message: z.string().default(""),
      service: z.string().optional(),
      source: z.string().default("erp"),
    })
    .parse(await req.json());
  const lead = await prisma.lead.create({ data: body });
  return NextResponse.json({ ok: true, lead });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
