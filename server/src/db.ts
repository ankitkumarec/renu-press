import { PrismaClient } from "@prisma/client";
import { config } from "./config";

/**
 * Shared Prisma client — AI never uses this directly.
 * Only services / business rules may touch the database.
 */
const globalForPrisma = globalThis as unknown as { gatewayPrisma?: PrismaClient };

export const prisma =
  globalForPrisma.gatewayPrisma ||
  new PrismaClient({
    datasources: config.databaseUrl ? { db: { url: config.databaseUrl } } : undefined,
    log: config.nodeEnv === "development" ? ["error", "warn"] : ["error"],
  });

if (config.nodeEnv !== "production") globalForPrisma.gatewayPrisma = prisma;
