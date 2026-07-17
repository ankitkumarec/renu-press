import { NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/auth";
import { homeForRole } from "@/lib/roles";
import { z } from "zod";

const schema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(4),
  expected: z.enum(["customer", "staff", "admin"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const result = await loginWithPassword(body.emailOrPhone, body.password);
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 401 });
    }

    const role = result.user.role;
    if (body.expected === "admin" && !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role)) {
      return NextResponse.json({ ok: false, message: "Admin access only." }, { status: 403 });
    }
    if (body.expected === "staff" && !["EMPLOYEE", "DESIGNER", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ ok: false, message: "Staff access only." }, { status: 403 });
    }
    if (body.expected === "customer" && role !== "CUSTOMER") {
      // Allow admin to also open portal if needed — block only staff without customer
      if (["EMPLOYEE", "DESIGNER"].includes(role)) {
        return NextResponse.json({ ok: false, message: "Use Staff login for production access." }, { status: 403 });
      }
    }

    return NextResponse.json({
      ok: true,
      role,
      name: result.user.name,
      redirect: homeForRole(role),
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
