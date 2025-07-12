/*
  Warnings:

  - You are about to drop the column `customDeadline` on the `UserAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `customDescription` on the `UserAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `customGoalAmount` on the `UserAchievement` table. All the data in the column will be lost.
  - You are about to drop the column `customName` on the `UserAchievement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAchievement" DROP COLUMN "customDeadline",
DROP COLUMN "customDescription",
DROP COLUMN "customGoalAmount",
DROP COLUMN "customName";

-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GAIN',
    "goal" INTEGER NOT NULL DEFAULT 10,
    "goalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quest_userId_key" ON "Quest"("userId");

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
