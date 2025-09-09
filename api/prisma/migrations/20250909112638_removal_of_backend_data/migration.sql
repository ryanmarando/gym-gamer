/*
  Warnings:

  - You are about to drop the column `level` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `levelProgress` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `muteSounds` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `totalWeightLifted` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyWeightLifted` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `weightSystem` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgressPhoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserWeightEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserWorkout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutSplit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ProgressPhoto" DROP CONSTRAINT "ProgressPhoto_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quest" DROP CONSTRAINT "Quest_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAchievement" DROP CONSTRAINT "UserAchievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAchievement" DROP CONSTRAINT "UserAchievement_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserWeightEntry" DROP CONSTRAINT "UserWeightEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserWorkout" DROP CONSTRAINT "UserWorkout_dayId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserWorkout" DROP CONSTRAINT "UserWorkout_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserWorkout" DROP CONSTRAINT "UserWorkout_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Workout" DROP CONSTRAINT "Workout_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutDay" DROP CONSTRAINT "WorkoutDay_splitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutEntry" DROP CONSTRAINT "WorkoutEntry_userId_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutSplit" DROP CONSTRAINT "WorkoutSplit_userId_fkey";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "level",
DROP COLUMN "levelProgress",
DROP COLUMN "muteSounds",
DROP COLUMN "totalWeightLifted",
DROP COLUMN "weeklyWeightLifted",
DROP COLUMN "weightSystem",
DROP COLUMN "xp";

-- DropTable
DROP TABLE "public"."Achievement";

-- DropTable
DROP TABLE "public"."ProgressPhoto";

-- DropTable
DROP TABLE "public"."Quest";

-- DropTable
DROP TABLE "public"."UserAchievement";

-- DropTable
DROP TABLE "public"."UserWeightEntry";

-- DropTable
DROP TABLE "public"."UserWorkout";

-- DropTable
DROP TABLE "public"."Workout";

-- DropTable
DROP TABLE "public"."WorkoutDay";

-- DropTable
DROP TABLE "public"."WorkoutEntry";

-- DropTable
DROP TABLE "public"."WorkoutSplit";

-- DropEnum
DROP TYPE "public"."AchievementType";

-- DropEnum
DROP TYPE "public"."WeightSystem";

-- DropEnum
DROP TYPE "public"."WorkoutArchitype";
