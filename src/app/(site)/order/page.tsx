import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { QuoteForm } from "@/components/forms/QuoteForm";

export const metadata: Metadata = { title: "Book Order" };

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const sp = await searchParams;
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-rp grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Book an order</h1>
          <ol className="mt-8 space-y-4 text-sm text-[var(--color-muted)]">
            <li>1. Select product & size</li>
            <li>2. Choose material & quantity</li>
            <li>3. Upload artwork or request design</li>
            <li>4. Admin confirms estimate & advance</li>
            <li>5. Production · status updates · delivery</li>
          </ol>
          <p className="mt-6 text-sm">
            Already a customer?{" "}
            <Link href="/login" className="font-semibold underline">
              Login
            </Link>{" "}
            for order history and invoices.
          </p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <QuoteForm services={services.map((s) => s.name)} defaultService={sp.service || ""} />
        </div>
      </div>
    </div>
  );
}
