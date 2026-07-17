import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  expenseDate: z.string().optional(),
  vendorName: z.string().optional(),
  paymentMethod: z.string().default("CASH"),
  bankName: z.string().optional(),
  upiRef: z.string().optional(),
  referenceNo: z.string().optional(),
  billNumber: z.string().optional(),
  gstAmount: z.number().optional(),
  gstNumber: z.string().optional(),
  description: z.string().optional(),
  proofDataUrl: z.string().optional(),
  proofName: z.string().optional(),
  ocrRaw: z.string().optional(),
  status: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const expenses = await prisma.expense.findMany({ orderBy: { expenseDate: "desc" }, take: 100 });
  return NextResponse.json({ ok: true, expenses });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = schema.parse(await req.json());
    const expense = await prisma.expense.create({
      data: {
        title: body.title,
        category: body.category,
        amount: body.amount,
        expenseDate: body.expenseDate ? new Date(body.expenseDate) : new Date(),
        vendorName: body.vendorName || null,
        paymentMethod: body.paymentMethod,
        bankName: body.bankName || null,
        upiRef: body.upiRef || null,
        referenceNo: body.referenceNo || null,
        billNumber: body.billNumber || null,
        gstAmount: body.gstAmount || 0,
        gstNumber: body.gstNumber || null,
        description: body.description || null,
        proofUrl: body.proofDataUrl || null,
        proofName: body.proofName || null,
        ocrRaw: body.ocrRaw || null,
        status: body.status || "PAID",
        createdById: session.id,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "EXPENSE_CREATE",
        entity: "Expense",
        meta: JSON.stringify({ id: expense.id, amount: expense.amount }),
      },
    });
    return NextResponse.json({ ok: true, expense });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}
