/*
  Warnings:

  - You are about to drop the column `userId` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `userId` to the `WorkoutEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Workout" DROP CONSTRAINT "Workout_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutEntry" DROP CONSTRAINT "WorkoutEntry_workoutId_fkey";

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "WorkoutEntry" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "UserWorkout" (
    "userId" INTEGER NOT NULL,
    "workoutId" INTEGER NOT NULL,

    CONSTRAINT "UserWorkout_pkey" PRIMARY KEY ("userId","workoutId")
);

-- AddForeignKey
ALTER TABLE "UserWorkout" ADD CONSTRAINT "UserWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkout" ADD CONSTRAINT "UserWorkout_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutEntry" ADD CONSTRAINT "WorkoutEntry_userId_workoutId_fkey" FOREIGN KEY ("userId", "workoutId") REFERENCES "UserWorkout"("userId", "workoutId") ON DELETE RESTRICT ON UPDATE CASCADE;
