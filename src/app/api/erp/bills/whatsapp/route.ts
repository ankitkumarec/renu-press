import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  billNo: z.string().min(1),
  customerName: z.string().optional(),
  whatsapp: z.string().min(8),
  total: z.number().optional(),
  /** data:image/png;base64,... or raw base64 */
  imageBase64: z.string().min(100),
});

function normalizePhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  return d;
}

function stripDataUrl(b64: string) {
  const i = b64.indexOf("base64,");
  return i >= 0 ? b64.slice(i + 7) : b64;
}

/**
 * 1) Bill PNG DB me save
 * 2) Public URL banaye
 * 3) Agar WhatsApp Cloud API keys hain → image DIRECT customer pe bhejo
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const phone = normalizePhone(body.whatsapp);
    if (phone.length < 12) {
      return NextResponse.json({ ok: false, message: "Invalid phone" }, { status: 400 });
    }

    const dataBase64 = stripDataUrl(body.imageBase64);
    // size guard ~3MB base64
    if (dataBase64.length > 4_000_000) {
      return NextResponse.json({ ok: false, message: "Image too large" }, { status: 400 });
    }

    const row = await prisma.billImage.create({
      data: {
        billNo: body.billNo,
        phone,
        customerName: body.customerName || null,
        total: body.total ?? null,
        dataBase64,
        mimeType: "image/png",
      },
    });

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "https://renu-press.vercel.app";
    const base = origin.replace(/\/$/, "");
    const imageUrl = `${base}/api/public/bill/${row.id}`;

    await prisma.documentVault.create({
      data: {
        title: `Bill ${body.billNo} PNG`,
        category: "Bills",
        fileUrl: imageUrl,
        fileName: `${body.billNo}.png`,
        relatedTo: JSON.stringify({ billImageId: row.id, phone, total: body.total }),
      },
    }).catch(() => null);

    // —— WhatsApp Cloud API (official image message) ——
    const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "";
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

    if (token && phoneNumberId) {
      const apiRes = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "image",
            image: {
              link: imageUrl,
              caption: `${body.billNo}${body.total != null ? ` · ₹${body.total}` : ""}`,
            },
          }),
        },
      );
      const apiJson = (await apiRes.json().catch(() => ({}))) as {
        error?: { message?: string };
        messages?: { id: string }[];
      };

      if (!apiRes.ok) {
        console.error("WA Cloud API error", apiJson);
        return NextResponse.json({
          ok: true,
          mode: "link",
          imageUrl,
          billImageId: row.id,
          cloudApiError: apiJson.error?.message || "Cloud API failed",
          message:
            "Image save ho gayi. WhatsApp Cloud API fail — neeche se share try karo. " +
            (apiJson.error?.message || ""),
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: "BILL_WHATSAPP_IMAGE_SENT",
          entity: "BillImage",
          meta: JSON.stringify({ billNo: body.billNo, phone, waId: apiJson.messages?.[0]?.id }),
        },
      });

      return NextResponse.json({
        ok: true,
        mode: "cloud_api",
        imageUrl,
        billImageId: row.id,
        message: "✓ Bill PNG customer ke WhatsApp pe bhej di gayi (Cloud API).",
      });
    }

    // No Cloud API keys — return public image for client share
    return NextResponse.json({
      ok: true,
      mode: "share",
      imageUrl,
      billImageId: row.id,
      message:
        "PNG ready. Ab share sheet se WhatsApp choose karo — image jayegi. Cloud API keys nahi hain (auto-send ke liye WHATSAPP_ACCESS_TOKEN set karo).",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Failed" },
      { status: 400 },
    );
  }
}
