/*
  Warnings:

  - You are about to drop the column `userId` on the `WorkoutEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkoutEntry" DROP CONSTRAINT "WorkoutEntry_userId_fkey";

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutEntry" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
