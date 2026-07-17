import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const list = await prisma.supportConversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      _count: { select: { messages: true, files: true } },
    },
  });
  const alerts = await prisma.adminAlert.findMany({
    where: { read: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ ok: true, conversations: list, alerts });
}

const patchSchema = z.object({
  conversationId: z.string(),
  status: z.string().optional(),
  quotePrice: z.number().optional(),
  quoteDelivery: z.string().optional(),
  quoteRemarks: z.string().optional(),
  quotePdfUrl: z.string().optional(),
  adminMessage: z.string().optional(),
  markAlertRead: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const body = patchSchema.parse(await req.json());
    const conv = await prisma.supportConversation.findUnique({ where: { id: body.conversationId } });
    if (!conv) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.status) data.status = body.status;
    if (body.quotePrice !== undefined) {
      data.quotePrice = body.quotePrice;
      data.quoteStatus = "QUOTE_SENT";
      data.status = body.status || "QUOTE_SENT";
    }
    if (body.quoteDelivery !== undefined) data.quoteDelivery = body.quoteDelivery;
    if (body.quoteRemarks !== undefined) data.quoteRemarks = body.quoteRemarks;
    if (body.quotePdfUrl !== undefined) data.quotePdfUrl = body.quotePdfUrl;

    const updated = await prisma.supportConversation.update({
      where: { id: body.conversationId },
      data,
    });

    if (body.adminMessage?.trim()) {
      await prisma.supportMessage.create({
        data: {
          conversationId: conv.id,
          role: "admin",
          content: body.adminMessage.trim(),
          messageType: "text",
          metadata: JSON.stringify({ by: session.name }),
        },
      });
    }

    if (body.quotePrice !== undefined) {
      await prisma.supportMessage.create({
        data: {
          conversationId: conv.id,
          role: "admin",
          content: [
            "Quotation update from RENU PRESS team:",
            body.quotePrice != null ? `Approved amount: ₹${body.quotePrice}` : "",
            body.quoteDelivery ? `Delivery (confirmed): ${body.quoteDelivery}` : "",
            body.quoteRemarks ? `Remarks: ${body.quoteRemarks}` : "",
            body.quotePdfUrl ? `PDF: ${body.quotePdfUrl}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
          messageType: "text",
          metadata: JSON.stringify({ type: "quote_approval", by: session.name }),
        },
      });

      if (conv.leadId) {
        await prisma.lead.update({
          where: { id: conv.leadId },
          data: {
            status: "quote_sent",
            notes: `Quote ₹${body.quotePrice} · ${body.quoteDelivery || ""} · ${body.quoteRemarks || ""}`,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "SUPPORT_ADMIN_UPDATE",
        entity: "SupportConversation",
        meta: JSON.stringify(body),
      },
    });

    return NextResponse.json({ ok: true, conversation: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Update failed" }, { status: 400 });
  }
}
