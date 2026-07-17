-- DropForeignKey
ALTER TABLE "ArtworkInspection" DROP CONSTRAINT "ArtworkInspection_supportFileId_fkey";

-- DropForeignKey
ALTER TABLE "ArtworkInspection" DROP CONSTRAINT "ArtworkInspection_parentId_fkey";

-- AlterTable
ALTER TABLE "SupportFile" DROP COLUMN "inspectionId",
DROP COLUMN "printGrade",
DROP COLUMN "printScore";

-- DropTable
DROP TABLE "ArtworkInspection";
