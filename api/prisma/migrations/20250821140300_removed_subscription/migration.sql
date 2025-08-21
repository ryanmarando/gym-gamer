/*
  Warnings:

  - You are about to drop the column `isSubscribed` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEndDate` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "isSubscribed",
DROP COLUMN "subscriptionEndDate";
