import { prisma } from "./db";

export async function getSettings() {
  let s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!s) {
    s = await prisma.siteSettings.create({ data: { id: "main" } });
  }
  return s;
}

export async function getFeaturedServices(limit = 8) {
  return prisma.service.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}

export async function getCategoriesWithServices() {
  return prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}
