import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const services = await prisma.service.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  const posts = await prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });

  const staticRoutes = ["", "/services", "/about", "/portfolio", "/gallery", "/quote", "/order", "/track", "/contact", "/faq", "/blog", "/careers", "/process", "/support"].map(
    (p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
    }),
  );

  return [
    ...staticRoutes,
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
