-- DropForeignKey
ALTER TABLE "ProgressPhoto" DROP CONSTRAINT "ProgressPhoto_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkout" DROP CONSTRAINT "UserWorkout_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkout" DROP CONSTRAINT "UserWorkout_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutEntry" DROP CONSTRAINT "WorkoutEntry_userId_workoutId_fkey";

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "createdByUserId" INTEGER;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "levelProgress" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkout" ADD CONSTRAINT "UserWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkout" ADD CONSTRAINT "UserWorkout_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutEntry" ADD CONSTRAINT "WorkoutEntry_userId_workoutId_fkey" FOREIGN KEY ("userId", "workoutId") REFERENCES "UserWorkout"("userId", "workoutId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
