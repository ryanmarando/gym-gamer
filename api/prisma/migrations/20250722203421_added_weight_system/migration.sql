-- CreateEnum
CREATE TYPE "WeightSystem" AS ENUM ('IMPERIAL', 'METRIC');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "weightSystem" "WeightSystem" NOT NULL DEFAULT 'IMPERIAL';
