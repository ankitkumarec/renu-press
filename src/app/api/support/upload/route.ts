import { NextResponse } from "next/server";
import { handleUpload } from "@/lib/support/service";
import { MAX_FILE_BYTES } from "@/lib/support/constants";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const sessionId = String(form.get("sessionId") || "");
    const caption = String(form.get("caption") || "");
    const file = form.get("file");

    if (!sessionId) {
      return NextResponse.json({ ok: false, message: "Missing session" }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "No file" }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, message: "File max 8 MB" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    let dataUrl: string | undefined;
    // Store small images/PDFs as data URL for admin preview
    if (buf.length <= 2 * 1024 * 1024 && (mimeType.startsWith("image/") || mimeType === "application/pdf")) {
      dataUrl = `data:${mimeType};base64,${buf.toString("base64")}`;
    }

    const result = await handleUpload({
      sessionId,
      fileName: file.name,
      mimeType,
      sizeBytes: file.size,
      dataUrl,
      caption,
    });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      file: {
        id: result.file.id,
        fileName: result.file.fileName,
        mimeType: result.file.mimeType,
        category: result.file.category,
        sizeBytes: result.file.sizeBytes,
      },
      analysis: result.analysis,
      recommendation: result.recommendation,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg === "SESSION_NOT_FOUND") {
      return NextResponse.json({ ok: false, message: "Session expired" }, { status: 404 });
    }
    if (msg === "FILE_TOO_LARGE") {
      return NextResponse.json({ ok: false, message: "File too large (max 8MB)" }, { status: 400 });
    }
    if (msg === "FILE_TYPE_NOT_ALLOWED") {
      return NextResponse.json({ ok: false, message: "File type not allowed" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, message: "Upload failed" }, { status: 500 });
  }
}
