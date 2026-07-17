import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  billNo: z.string().min(1),
  customerName: z.string().min(1),
  whatsapp: z.string().min(8),
  items: z.array(
    z.object({
      name: z.string(),
      qty: z.number(),
      rate: z.number(),
    }),
  ),
  subtotal: z.number(),
  gst: z.number(),
  total: z.number(),
  note: z.string().optional(),
});

/** Store bill metadata in document vault for audit */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = schema.parse(await req.json());
    await prisma.documentVault.create({
      data: {
        title: `Bill ${body.billNo} — ${body.customerName}`,
        category: "Bills",
        fileUrl: "#",
        fileName: `${body.billNo}.png`,
        relatedTo: JSON.stringify({
          billNo: body.billNo,
          whatsapp: body.whatsapp,
          total: body.total,
          items: body.items,
          note: body.note,
        }),
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "BILL_GENERATED",
        entity: "Bill",
        meta: JSON.stringify({ billNo: body.billNo, total: body.total }),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}
