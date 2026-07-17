import { NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const result = await loginWithPassword(body.emailOrPhone, body.password);
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 401 });
    }
    return NextResponse.json({
      ok: true,
      role: result.user.role,
      name: result.user.name,
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
