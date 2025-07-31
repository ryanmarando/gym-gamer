import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

export const prisma = new PrismaClient();

export const jwtSecret = process.env.JWT_SECRET;

export const resend = new Resend(process.env.RESEND_KEY);
export const resendEmail = process.env.RESEND_EMAIL;
