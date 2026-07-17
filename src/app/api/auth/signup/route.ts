import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }] },
    });
    if (exists) {
      return NextResponse.json({ ok: false, message: "Email or phone already registered." }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: await hashPassword(data.password),
        role: "CUSTOMER",
        customerProfile: { create: {} },
      },
    });
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "CUSTOMER",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
