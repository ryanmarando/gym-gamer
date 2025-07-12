/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `WorkoutSplit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSplit_userId_key" ON "WorkoutSplit"("userId");
