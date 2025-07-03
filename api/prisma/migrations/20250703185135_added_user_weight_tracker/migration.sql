/*
  Warnings:

  - You are about to drop the column `weight` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "weight";

-- CreateTable
CREATE TABLE "UserWeightEntry" (
    "id" SERIAL NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserWeightEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserWeightEntry" ADD CONSTRAINT "UserWeightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
