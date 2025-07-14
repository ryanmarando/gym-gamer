/*
  Warnings:

  - You are about to drop the column `descprtion` on the `Achievement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "descprtion",
ADD COLUMN     "description" TEXT;
