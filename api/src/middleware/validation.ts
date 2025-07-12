import { NextFunction, Request, Response } from "express";
import z, { ZodSchema } from "zod";
import { string } from "zod/v4";

const WorkoutArchitypeEnum = z.enum([
    "PUSH",
    "PULL",
    "LEGS",
    "CHEST",
    "SHOULDERS",
    "ARMS",
    "BACK",
    "ABS",
    "QUADS",
    "HAMSTRINGS",
    "GLUTES",
    "CALVES",
]);

export const WorkoutSplitInputSchema = z.object({
    days: z.array(z.string()).min(3).max(7),
});

export const WeightEntrySchema = z.object({
    weight: z.number({ message: "Weight must be a number" }),
});

export const CustomWorkoutInputSchema = z.object({
    userId: z.number(),
    customName: z
        .string()
        .max(50, { message: "Name must be at most 50 characters" }),
    architype: z
        .array(WorkoutArchitypeEnum)
        .nonempty("Must select at least one architype"),
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

export const UpdateUserQuestionInputSchema = z.object({
    customGoalAmount: z.number(),
    customDeadline: z.string(),
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
