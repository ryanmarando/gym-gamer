-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "baseXP" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
