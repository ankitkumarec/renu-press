import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const staff = await prisma.user.findMany({
    where: { role: { in: ["EMPLOYEE", "DESIGNER", "MANAGER", "ADMIN"] }, isActive: true },
    include: {
      employeeProfile: true,
      attendance: { orderBy: { date: "desc" }, take: 14 },
      staffPayments: { orderBy: { paidAt: "desc" }, take: 20 },
      salarySlips: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });
  return NextResponse.json({ ok: true, staff });
}

const staffSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  role: z.string().default("EMPLOYEE"),
  department: z.string().optional(),
  designation: z.string().optional(),
  salary: z.number().default(0),
  password: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = staffSchema.parse(await req.json());
  const passwordHash = await bcrypt.hash(body.password || "Staff@123", 10);
  const user = await prisma.user.create({
    data: {
      name: body.name,
      phone: body.phone || null,
      email: body.email || `staff_${Date.now()}@renupress.local`,
      role: body.role,
      passwordHash,
      employeeProfile: {
        create: {
          department: body.department || "Production",
          designation: body.designation || "Staff",
          salary: body.salary,
          joinDate: new Date(),
        },
      },
    },
  });
  return NextResponse.json({ ok: true, user });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("attendance"),
    userId: z.string(),
    status: z.string().default("PRESENT"),
    notes: z.string().optional(),
    date: z.string().optional(),
  }),
  z.object({
    action: z.literal("payment"),
    userId: z.string(),
    type: z.enum(["ADVANCE", "SALARY", "BONUS"]),
    amount: z.number().positive(),
    method: z.string().default("CASH"),
    note: z.string().optional(),
  }),
  z.object({
    action: z.literal("delete"),
    userId: z.string(),
  }),
]);

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = actionSchema.parse(await req.json());

  if (body.action === "attendance") {
    const day = body.date ? new Date(body.date) : new Date();
    day.setHours(0, 0, 0, 0);
    const row = await prisma.attendance.upsert({
      where: { userId_date: { userId: body.userId, date: day } },
      create: {
        userId: body.userId,
        date: day,
        status: body.status,
        notes: body.notes || null,
        checkIn: body.status === "PRESENT" ? new Date() : null,
      },
      update: {
        status: body.status,
        notes: body.notes || null,
        checkIn: body.status === "PRESENT" ? new Date() : null,
      },
    });
    return NextResponse.json({ ok: true, attendance: row });
  }

  if (body.action === "payment") {
    const pay = await prisma.staffPayment.create({
      data: {
        userId: body.userId,
        type: body.type,
        amount: body.amount,
        method: body.method,
        note: body.note || null,
      },
    });
    return NextResponse.json({ ok: true, payment: pay });
  }

  if (body.action === "delete") {
    await prisma.user.update({
      where: { id: body.userId },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
