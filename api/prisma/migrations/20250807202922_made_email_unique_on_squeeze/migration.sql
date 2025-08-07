/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `SqueezePageUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SqueezePageUser_email_key" ON "public"."SqueezePageUser"("email");
