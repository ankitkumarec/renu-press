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
 * Upload PNG bytes to WhatsApp Cloud media, then send as image message.
 * More reliable than public link (Meta hosts the file).
 */
async function sendWhatsAppImageByUpload(opts: {
  token: string;
  phoneNumberId: string;
  to: string;
  pngBuffer: Buffer;
  caption: string;
}): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const form = new FormData();
  const bytes = new Uint8Array(opts.pngBuffer);
  const blob = new Blob([bytes], { type: "image/png" });
  form.append("file", blob, "bill.png");
  form.append("messaging_product", "whatsapp");
  form.append("type", "image/png");

  const upRes = await fetch(`https://graph.facebook.com/v21.0/${opts.phoneNumberId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.token}` },
    body: form,
  });
  const upJson = (await upRes.json().catch(() => ({}))) as {
    id?: string;
    error?: { message?: string };
  };

  if (!upRes.ok || !upJson.id) {
    return { ok: false, error: upJson.error?.message || `Media upload failed (${upRes.status})` };
  }

  const msgRes = await fetch(`https://graph.facebook.com/v21.0/${opts.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: opts.to,
      type: "image",
      image: {
        id: upJson.id,
        caption: opts.caption,
      },
    }),
  });
  const msgJson = (await msgRes.json().catch(() => ({}))) as {
    messages?: { id: string }[];
    error?: { message?: string };
  };

  if (!msgRes.ok) {
    return { ok: false, error: msgJson.error?.message || `Send failed (${msgRes.status})` };
  }

  return { ok: true, messageId: msgJson.messages?.[0]?.id };
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized — pehle ERP login karo" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const phone = normalizePhone(body.whatsapp);
    if (phone.length < 12) {
      return NextResponse.json({ ok: false, message: "Invalid phone (10 digit mobile chahiye)" }, { status: 400 });
    }

    const dataBase64 = stripDataUrl(body.imageBase64);
    if (dataBase64.length > 4_000_000) {
      return NextResponse.json({ ok: false, message: "Image too large" }, { status: 400 });
    }

    const pngBuffer = Buffer.from(dataBase64, "base64");

    // Save for records / public link fallback
    let rowId: string | null = null;
    try {
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
      rowId = row.id;
    } catch (dbErr) {
      console.error("BillImage save failed (table missing?)", dbErr);
      // continue — Cloud API upload does not need DB
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "https://renu-press.vercel.app";
    const imageUrl = rowId ? `${origin.replace(/\/$/, "")}/api/public/bill/${rowId}` : null;

    const token = (process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "").trim();
    const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();

    if (!token || !phoneNumberId) {
      return NextResponse.json({
        ok: false,
        mode: "no_api_keys",
        imageUrl,
        message:
          "Server pe WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID nahi milay. Vercel Environment Variables me daalo aur Redeploy karo.",
      });
    }

    const caption = `RENU PRESS · ${body.billNo}${body.total != null ? ` · ₹${body.total}` : ""}`;
    const sent = await sendWhatsAppImageByUpload({
      token,
      phoneNumberId,
      to: phone,
      pngBuffer,
      caption,
    });

    if (!sent.ok) {
      console.error("WA image send error", sent.error);
      return NextResponse.json({
        ok: false,
        mode: "cloud_api_error",
        imageUrl,
        cloudApiError: sent.error,
        message: `WhatsApp image fail: ${sent.error}. Number Meta "To" list me verified hona chahiye.`,
      });
    }

    await prisma.auditLog
      .create({
        data: {
          userId: session.id,
          action: "BILL_WHATSAPP_IMAGE_SENT",
          entity: "BillImage",
          meta: JSON.stringify({ billNo: body.billNo, phone, waId: sent.messageId }),
        },
      })
      .catch(() => null);

    return NextResponse.json({
      ok: true,
      mode: "cloud_api",
      imageUrl,
      billImageId: rowId,
      message: "✓ Bill PNG image WhatsApp pe bhej di gayi. Chat me Meta test number se check karo.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Failed" },
      { status: 400 },
    );
  }
}
