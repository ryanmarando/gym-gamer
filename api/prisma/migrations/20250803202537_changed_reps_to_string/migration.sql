-- AlterTable
ALTER TABLE "public"."UserWorkout" ALTER COLUMN "reps" SET DEFAULT ARRAY['10', '10', '10']::TEXT[],
ALTER COLUMN "reps" SET DATA TYPE TEXT[];
