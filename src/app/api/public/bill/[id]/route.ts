import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/** Public bill PNG — WhatsApp Cloud API / link open ke liye (auth nahi) */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const row = await prisma.billImage.findUnique({ where: { id } });
    if (!row) {
      return new NextResponse("Not found", { status: 404 });
    }

    // expire after 7 days
    const age = Date.now() - new Date(row.createdAt).getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) {
      return new NextResponse("Expired", { status: 410 });
    }

    const buf = Buffer.from(row.dataBase64, "base64");
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": row.mimeType || "image/png",
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${row.billNo}.png"`,
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("Error", { status: 500 });
  }
}
