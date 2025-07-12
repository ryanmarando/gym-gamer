import { Request, Response } from "express";
import { prisma } from "../config.js";

export const updateUserQuest = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const { customType, customGoalAmount, customDeadline } = req.body;

        if (!userId) {
            res.status(400).json({ error: "Missing userId" });
            return;
        }

        // Parse userId and deadline properly
        const userIdInt = parseInt(userId as string, 10);

        // Validate input
        if (!customType || !customGoalAmount || !customDeadline) {
            res.status(400).json({
                error: "Missing customType, customGoalAmount, or customDeadline",
            });
            return;
        }

        const goalDate = new Date(customDeadline);
        const formattedType =
            customType.charAt(0).toUpperCase() +
            customType.slice(1).toLowerCase();

        // Upsert: update if exists, create if not
        const updatedQuest = await prisma.quest.upsert({
            where: { userId: userIdInt },
            update: {
                type: customType,
                goal: customGoalAmount,
                goalDate: goalDate,
                name: `${formattedType} ${customGoalAmount} lbs by ${goalDate.toLocaleDateString()}`,
            },
            create: {
                userId: userIdInt,
                type: customType,
                goal: customGoalAmount,
                goalDate: goalDate,
                name: `${formattedType} ${customGoalAmount} lbs by ${goalDate.toLocaleDateString()}`,
            },
        });

        res.status(200).json(updatedQuest);
        return;
    } catch (error) {
        console.error("Error updating user quest:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};
