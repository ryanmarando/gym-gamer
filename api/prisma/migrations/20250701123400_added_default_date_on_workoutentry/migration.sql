/*
  Warnings:

  - You are about to drop the column `date` on the `WorkoutEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkoutEntry" DROP COLUMN "date",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
