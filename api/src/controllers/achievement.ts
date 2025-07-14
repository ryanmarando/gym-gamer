import { NextFunction, Request, Response } from "express";
import { prisma } from "../config.js";
import { progressAchievement } from "../functions/progressAchievement.js";
import { weeklyReset } from "../functions/weeklyReset.js";

export const getAllAchievements = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const achivements = await prisma.achievement.findMany({});

        if (!achivements || achivements.length === 0) {
            res.status(400).json({ message: "No achievements found." });
            return;
        }

        res.status(200).json(achivements);
    } catch (error) {
        console.log(`Error GET of All achievements: ${error}`);
        res.status(500).json({ message: `Error: ${error}` });
    }
};

export const saveAllAchievementsToUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = Number(req.query.userId);

        if (!userId) {
            console.log("❌ No user id provided.");
            res.status(400).json({ message: "Please enter a valid user id." });
            return;
        }

        // Make sure user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        // Get all achievements
        const allAchievements = await prisma.achievement.findMany();

        // Get all existing user achievements
        const existingUserAchievements = await prisma.userAchievement.findMany({
            where: { userId },
        });

        const existingIds = new Set(
            existingUserAchievements.map((ua) => ua.achievementId)
        );

        // Filter only the missing ones
        const missingAchievements = allAchievements.filter(
            (ach) => !existingIds.has(ach.id)
        );

        if (missingAchievements.length === 0) {
            res.status(200).json({
                message: "✅ User already has all achievements saved.",
            });
            return;
        }

        // Bulk create all missing ones
        const createData = missingAchievements.map((ach) => ({
            userId: userId,
            achievementId: ach.id,
        }));

        await prisma.userAchievement.createMany({
            data: createData,
            skipDuplicates: true, // extra safety!
        });

        res.status(200).json({
            message: `✅ Added ${missingAchievements.length} achievements to userId ${userId}.`,
        });
        return;
    } catch (error) {
        console.error("❌ Error saving all achievements for user:", error);
        res.status(500).json({
            error: `Unsuccessful PATCH to save all user achievements: ${error}`,
        });
        return;
    }
};

export const deleteAchievementByIdFromUser = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = Number(req.query.userId);
        const achievementId = Number(req.query.achievementId);

        if (!userId || !achievementId) {
            res.status(400).json({
                message: "Please provide userId and workoutId.",
            });
            return;
        }

        const deleted = await prisma.userAchievement.deleteMany({
            where: {
                userId: userId,
                achievementId: achievementId,
            },
        });

        res.status(200).json({
            message: `Deleted ${deleted.count} achievements for userId ${userId} and achievementId ${achievementId}.`,
        });
    } catch (error) {
        console.error("Error deleting all achievements from user:", error);
        res.status(500).json({
            message: "Failed to delete all achievements from user.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const deleteAllAchievements = async (req: Request, res: Response) => {
    try {
        const deletedAchievements = await prisma.achievement.deleteMany({});

        res.status(200).json({
            message: `Deleted ${deletedAchievements.count} achievements.`,
        });
    } catch (error) {
        console.error("Error deleting all achievements:", error);
        res.status(500).json({
            message: "Failed to delete all achievements.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const updateAchievementProgress = async (
    req: Request,
    res: Response
) => {
    const { userId, achievementId, progressToAdd } = req.body;

    try {
        await prisma.$transaction(async (tx) => {
            await progressAchievement(tx, userId, achievementId, progressToAdd);
        });

        // ✅ Now get the full updated user for the response
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                xp: true,
                level: true,
                levelProgress: true,
                achievements: {
                    select: {
                        achievementId: true,
                        progress: true,
                        completed: true,
                        achievement: {
                            select: {
                                name: true,
                                xp: true,
                            },
                        },
                    },
                },
            },
        });

        res.json({
            message: "Progress updated!",
            updatedUser,
        });
    } catch (err) {
        if (err instanceof Error && err.message.includes("already completed")) {
            res.status(409).json({
                message: "Already completed this achievement",
            });
        } else {
            console.error(err);
            res.status(500).json({ message: "Something went wrong" });
        }
    }
};

export const weeklyAchivementReset = async (req: Request, res: Response) => {
    try {
        weeklyReset();
        res.status(200).json({ message: "Weekly reset complete." });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong with the weekly rest.",
        });
    }
};
