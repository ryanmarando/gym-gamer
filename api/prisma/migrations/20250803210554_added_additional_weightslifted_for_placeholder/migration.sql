-- AlterTable
ALTER TABLE "public"."UserWorkout" ADD COLUMN     "weightsLifted" TEXT[] DEFAULT ARRAY['0', '0', '0']::TEXT[];
