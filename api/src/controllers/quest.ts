import { Request, Response } from "express";
import { prisma } from "../config.js";
import { checkAndProgressAchievements } from "../functions/checkAndProgressAchivements.js";
import { addXpAndCheckLevelUp } from "../functions/addXPAndCheckLevelUp.js";
import { AchievementType } from "@prisma/client";

const completedQuestProgressBase = 500;

export const updateUserQuest = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const { customType, customGoalAmount, customDeadline } = req.body;

        if (!userId) {
            res.status(400).json({ error: "Missing userId" });
            return;
        }

        const userIdInt = parseInt(userId as string, 10);

        if (!customType || !customGoalAmount || !customDeadline) {
            res.status(400).json({
                error: "Missing customType, customGoalAmount, or customDeadline",
            });
            return;
        }

        // Use transaction for atomic updates
        const result = await prisma.$transaction(async (tx) => {
            // Upsert Quest
            const goalDate = new Date(customDeadline);
            const formattedType =
                customType.charAt(0).toUpperCase() +
                customType.slice(1).toLowerCase();

            const updatedQuest = await tx.quest.upsert({
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

            // Progress related achievements
            const questUpdatedAchievements = await checkAndProgressAchievements(
                tx,
                userIdInt,
                [AchievementType.CREATION],
                { creationType: "updateQuest" }
            );

            return {
                updatedQuest,
                questUpdatedAchievements,
            };
        });

        res.status(200).json({
            message: "Quest updated successfully",
            updatedQuest: result.updatedQuest,
            newlyCompletedAchievements: result.questUpdatedAchievements,
        });
    } catch (error) {
        console.error("Error updating user quest:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const completeQuest = async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    let newlyCompleted;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Award XP for the workout itself
            const completeQuestResult = await addXpAndCheckLevelUp(
                userId,
                completedQuestProgressBase,
                tx
            );

            // 2️⃣ Progress any matching achievements
            const questCompletedAchievements =
                await checkAndProgressAchievements(tx, userId, [
                    AchievementType.QUEST,
                ]);

            newlyCompleted = [
                ...(completeQuestResult.newlyCompletedAchievements || []),
                ...(questCompletedAchievements || []),
            ];

            // 3️⃣ Re-fetch fresh user with updated XP, level, progress, and achievements
            const freshUser = await tx.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    level: true,
                    levelProgress: true,
                    xp: true,
                    achievements: {
                        select: {
                            achievementId: true,
                            progress: true,
                            completed: true,
                            achievement: {
                                select: {
                                    name: true,
                                    xp: true,
                                    goalAmount: true,
                                },
                            },
                        },
                    },
                },
            });
            return freshUser;
        });

        res.json({
            message: "Progress updated for completing a quest!",
            user: result,
            newlyCompletedAchievements: newlyCompleted,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong completing the workout",
        });
    }
};
