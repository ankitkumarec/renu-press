const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BillImage" (
      "id" TEXT NOT NULL,
      "billNo" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "customerName" TEXT,
      "total" DOUBLE PRECISION,
      "dataBase64" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL DEFAULT 'image/png',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BillImage_pkey" PRIMARY KEY ("id")
    )
  `);
  await p.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BillImage_billNo_idx" ON "BillImage"("billNo")`);
  await p.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BillImage_createdAt_idx" ON "BillImage"("createdAt")`);
  console.log("BillImage table OK");
}

main()
  .then(() => p.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await p.$disconnect();
    process.exit(1);
  });
