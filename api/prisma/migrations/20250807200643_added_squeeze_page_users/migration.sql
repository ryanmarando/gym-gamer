-- CreateTable
CREATE TABLE "public"."SqueezePageUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "SqueezePageUser_pkey" PRIMARY KEY ("id")
);
