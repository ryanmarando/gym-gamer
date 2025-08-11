import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import Stripe from "stripe";

export const prisma = new PrismaClient();

export const jwtSecret = process.env.JWT_SECRET;

export const resend = new Resend(process.env.RESEND_KEY);
export const resendEmail = process.env.RESEND_EMAIL;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
