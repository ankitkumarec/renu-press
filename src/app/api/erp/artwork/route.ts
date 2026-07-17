import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const list = await prisma.artworkInspection.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ ok: true, inspections: list });
}

const patchSchema = z.object({
  inspectionId: z.string(),
  requestedFixes: z.array(z.string()).optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const body = patchSchema.parse(await req.json());
    const updated = await prisma.artworkInspection.update({
      where: { id: body.inspectionId },
      data: {
        requestedFixes: body.requestedFixes ? JSON.stringify(body.requestedFixes) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "ARTWORK_FIXES_REQUESTED",
        entity: "ArtworkInspection",
        meta: JSON.stringify(body),
      },
    });

    // Note in related conversation if any
    if (updated.conversationId && body.requestedFixes?.length) {
      await prisma.supportMessage.create({
        data: {
          conversationId: updated.conversationId,
          role: "admin",
          content: `Pre-press note: optional fixes queued for ${updated.fileName} — ${body.requestedFixes.join(", ")}. Original file remains unchanged.`,
          messageType: "system",
          metadata: JSON.stringify({ inspectionId: updated.id, fixes: body.requestedFixes }),
        },
      });
    }

    return NextResponse.json({ ok: true, inspection: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Update failed" }, { status: 400 });
  }
}
