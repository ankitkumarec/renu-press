import { NextResponse } from "next/server";
import { getOrCreateConversation } from "@/lib/support/service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
    const conv = await getOrCreateConversation(body.sessionId);
    return NextResponse.json({
      ok: true,
      sessionId: conv.sessionId,
      conversationId: conv.id,
      status: conv.status,
      messages: conv.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        messageType: m.messageType,
        metadata: m.metadata,
        createdAt: m.createdAt,
      })),
      files: conv.files?.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        mimeType: f.mimeType,
        category: f.category,
        sizeBytes: f.sizeBytes,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Could not start support session" }, { status: 500 });
  }
}
