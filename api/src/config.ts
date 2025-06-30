import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const jwtSecret = process.env.JWT_SECRET;
