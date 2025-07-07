-- CreateEnum
CREATE TYPE "WorkoutArchitype" AS ENUM ('PUSH', 'PULL', 'LEGS', 'CHEST', 'SHOULDERS', 'ARMS', 'BACK', 'ABS', 'QUADS', 'HAMSTRINGS', 'CALVES');

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "architype" "WorkoutArchitype"[];
