import { NextResponse } from "next/server";
import { z } from "zod";
import { handleChat } from "@/lib/support/service";

export const runtime = "nodejs";

const schema = z.object({
  sessionId: z.string().min(8),
  message: z.string().max(4000),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    if (!body.message.trim()) {
      return NextResponse.json({ ok: false, message: "Empty message" }, { status: 400 });
    }
    const result = await handleChat(body.sessionId, body.message.trim());
    return NextResponse.json({
      ok: true,
      reply: result.reply,
      message: {
        id: result.message.id,
        role: result.message.role,
        content: result.message.content,
        messageType: result.message.messageType,
        metadata: result.message.metadata,
        createdAt: result.message.createdAt,
      },
      recommendation: result.recommendation,
      sessionId: result.sessionId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chat failed";
    if (msg === "SESSION_NOT_FOUND") {
      return NextResponse.json({ ok: false, message: "Session expired. Refresh page." }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, message: "Could not send message" }, { status: 500 });
  }
}
