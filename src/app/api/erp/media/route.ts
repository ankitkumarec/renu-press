import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isErpRole } from "@/lib/roles";
import { z } from "zod";

/** Upload gallery / portfolio / product images as data URL stored in DB */
export async function GET() {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const [gallery, portfolio, products] = await Promise.all([
    prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" }, take: 100 }),
    prisma.portfolioItem.findMany({ orderBy: { sortOrder: "asc" }, take: 50 }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return NextResponse.json({ ok: true, gallery, portfolio, products });
}

const schema = z.object({
  kind: z.enum(["gallery", "portfolio", "product"]),
  title: z.string().min(1),
  imageUrl: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().optional(),
  album: z.string().optional(),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = schema.parse(await req.json());

  if (body.kind === "gallery") {
    const row = await prisma.galleryImage.create({
      data: {
        title: body.title,
        imageUrl: body.imageUrl,
        album: body.album || body.category || "General",
      },
    });
    return NextResponse.json({ ok: true, row });
  }

  if (body.kind === "portfolio") {
    const row = await prisma.portfolioItem.create({
      data: {
        title: body.title,
        category: body.category || "General",
        description: body.description || body.title,
        imageUrl: body.imageUrl,
        isFeatured: true,
      },
    });
    return NextResponse.json({ ok: true, row });
  }

  // product / gift
  const base = slugify(body.title) || "product";
  let slug = base;
  let n = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  const row = await prisma.product.create({
    data: {
      name: body.title,
      slug,
      description: body.description || body.title,
      basePrice: body.basePrice || 0,
      imageUrl: body.imageUrl,
      isActive: true,
    },
  });
  return NextResponse.json({ ok: true, row });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !isErpRole(session.role)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const id = searchParams.get("id");
  if (!kind || !id) return NextResponse.json({ ok: false }, { status: 400 });
  if (kind === "gallery") await prisma.galleryImage.delete({ where: { id } });
  if (kind === "portfolio") await prisma.portfolioItem.delete({ where: { id } });
  if (kind === "product") await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
