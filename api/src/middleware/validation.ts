import { NextFunction, Request, Response } from "express";
import z, { ZodSchema } from "zod";

export const WeightEntrySchema = z.object({
    weight: z.number({ message: "Weight must be a number" }),
});

export const CustomWorkoutInputSchema = z.object({
    userId: z.number(),
    customName: z
        .string()
        .max(50, { message: "Name must be at most 50 characters" }),
});

export const RegisterInputSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(8),
});

export const LoginInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const AchievementUpdateInputSchema = z.object({
    userId: z.number(),
    achievementId: z.number(),
    progressToAdd: z.number(),
});

export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validation = schema.safeParse(req.body);

        if (!validation.success) {
            console.error(
                "Validation Errors for schema",
                validation.error.issues
            );
            res.status(400).json({ errors: validation.error.issues });
            return;
        }

        // Optionally: attach parsed data to req.body so it’s type-safe
        req.body = validation.data;

        next();
    };
};
