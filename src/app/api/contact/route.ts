import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().optional(),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        message: data.message,
        source: "contact-form",
      },
    });
    return NextResponse.json({ ok: true, message: "Message received. We will get back to you." });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
