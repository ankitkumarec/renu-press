import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** Neon pooler URL — used if Vercel env is missing (demo deploy fallback). */
const FALLBACK_DATABASE_URL =
  "postgresql://neondb_owner:npg_6foncA4uTgSz@ep-still-night-ajs5it7s-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true";

function createPrisma() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = FALLBACK_DATABASE_URL;
  }
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL =
      "postgresql://neondb_owner:npg_6foncA4uTgSz@ep-still-night-ajs5it7s.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";
  }
  return new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
