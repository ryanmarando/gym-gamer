/*
  Warnings:

  - Added the required column `goalType` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('WORKOUT', 'WEIGHT_LOSS', 'MUSCLE_GAIN', 'QUEST', 'OTHER');

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "descprtion" TEXT,
ADD COLUMN     "goalAmount" DOUBLE PRECISION,
ADD COLUMN     "goalType" "AchievementType" NOT NULL,
ADD COLUMN     "isQuest" BOOLEAN NOT NULL DEFAULT false;
