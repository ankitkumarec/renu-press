import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  service: z.string().min(1),
  size: z.string().optional(),
  material: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    await prisma.quote.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        service: data.service,
        size: data.size || null,
        material: data.material || null,
        quantity: data.quantity,
        notes: data.notes || null,
        status: "requested",
      },
    });
    await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        service: data.service,
        message: data.notes || `Quote request for ${data.service}`,
        source: "quote-form",
      },
    });
    return NextResponse.json({
      ok: true,
      message: "Quote request received. RENU PRESS will contact you during business hours.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
