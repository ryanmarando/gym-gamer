import { Request, Response } from "express";
import { prisma } from "../config.js";
import { checkAndProgressAchievements } from "../functions/checkAndProgressAchivements.js";
import { addXpAndCheckLevelUp } from "../functions/addXPAndCheckLevelUp.js";
import { AchievementType } from "@prisma/client";

export const updateUserQuest = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const {
            customType,
            customGoalAmount,
            customDeadline,
            initialWeight,
            weightSystem,
        } = req.body;

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

            const unit = weightSystem === "METRIC" ? "kg" : "lbs";

            // Determine the suffix text based on goal type
            const dateSuffix =
                customType.toUpperCase() === "MAINTAIN"
                    ? `through ${goalDate.toLocaleDateString()}`
                    : `by ${goalDate.toLocaleDateString()}`;

            const questName = `${formattedType} ${customGoalAmount} ${unit} ${dateSuffix}`;

            const updatedQuest = await tx.quest.upsert({
                where: { userId: userIdInt },
                update: {
                    type: customType,
                    goal: customGoalAmount,
                    goalDate: goalDate,
                    initialWeight: initialWeight,
                    name: questName,
                },
                create: {
                    userId: userIdInt,
                    type: customType,
                    goal: customGoalAmount,
                    goalDate: goalDate,
                    name: questName,
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

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Fetch the user's quest to get baseXP and goal
            const quest = await tx.quest.findUnique({
                where: { userId },
                select: { baseXP: true, goal: true },
            });

            if (!quest) {
                throw new Error("Quest not found for user");
            }

            // Calculate XP to award = baseXP * goal
            const xpToAward = quest.baseXP * quest.goal;

            // 1️⃣ Award XP for completing the quest
            const completeQuestResult = await addXpAndCheckLevelUp(
                userId,
                xpToAward,
                tx
            );

            // 2️⃣ Progress any matching achievements
            const questCompletedAchievements =
                await checkAndProgressAchievements(tx, userId, [
                    AchievementType.QUEST,
                ]);

            // Combine newly completed achievements
            const newlyCompleted = [
                ...(completeQuestResult.newlyCompletedAchievements || []),
                ...(questCompletedAchievements || []),
            ];

            // 3️⃣ Re-fetch fresh user data
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

            return { freshUser, newlyCompleted, xpToAward };
        });

        res.json({
            message: "Progress updated for completing a quest!",
            user: result.freshUser,
            newlyCompletedAchievements: result.newlyCompleted,
            xp: result.xpToAward,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong completing the quest",
        });
    }
};
