const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const sqls = [
  `ALTER TABLE "SupportFile" ADD COLUMN IF NOT EXISTS "printScore" INTEGER`,
  `ALTER TABLE "SupportFile" ADD COLUMN IF NOT EXISTS "printGrade" TEXT`,
  `ALTER TABLE "SupportFile" ADD COLUMN IF NOT EXISTS "inspectionId" TEXT`,
  `CREATE TABLE IF NOT EXISTS "ArtworkInspection" (
    "id" TEXT NOT NULL,
    "supportFileId" TEXT,
    "conversationId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "grade" TEXT NOT NULL DEFAULT 'Average',
    "category" TEXT,
    "maxPrintSize" TEXT,
    "colourMode" TEXT,
    "resolutionLevel" TEXT,
    "warnings" TEXT,
    "suggestions" TEXT,
    "suitableProducts" TEXT,
    "reportJson" TEXT NOT NULL,
    "parentId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "requestedFixes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArtworkInspection_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "ArtworkInspection_conversationId_idx" ON "ArtworkInspection"("conversationId")`,
  `CREATE INDEX IF NOT EXISTS "ArtworkInspection_score_idx" ON "ArtworkInspection"("score")`,
  `CREATE INDEX IF NOT EXISTS "ArtworkInspection_createdAt_idx" ON "ArtworkInspection"("createdAt")`,
];

(async () => {
  for (const s of sqls) {
    try {
      await p.$executeRawUnsafe(s);
      console.log("OK", s.slice(0, 70).replace(/\n/g, " "));
    } catch (e) {
      console.log("skip", String(e.message || e).slice(0, 120));
    }
  }
  await p.$disconnect();
})();
