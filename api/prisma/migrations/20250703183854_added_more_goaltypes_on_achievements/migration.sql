/*
  Warnings:

  - The values [WEIGHT_LOSS,MUSCLE_GAIN,QUEST,OTHER] on the enum `AchievementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AchievementType_new" AS ENUM ('WORKOUT', 'STREAK', 'PERSONAL_BEST', 'SEASONAL', 'SOCIAL', 'MILESTONE');
ALTER TABLE "Achievement" ALTER COLUMN "goalType" TYPE "AchievementType_new" USING ("goalType"::text::"AchievementType_new");
ALTER TYPE "AchievementType" RENAME TO "AchievementType_old";
ALTER TYPE "AchievementType_new" RENAME TO "AchievementType";
DROP TYPE "AchievementType_old";
COMMIT;
