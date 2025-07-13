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

export const saveToUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const achievementId = Number(req.query.achievementId);
        const userId = Number(req.query.userId);

        if (!userId) {
            console.log("Unsuccessful query... no user id.");
            res.status(400).json({ message: "Please enter a valid user id." });
            return;
        }

        const achievementToBeAdded = await prisma.achievement.findFirst({
            where: { id: achievementId },
        });

        if (!achievementToBeAdded) {
            console.log("Unsuccessful query... no achievement id found.");
            res.status(400).json({
                message: "Please enter a valid achievement id.",
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(400).json({
                message: "User not found.",
            });
            return;
        }

        const existing = await prisma.userAchievement.findFirst({
            where: {
                userId: userId,
                achievementId: achievementId,
            },
        });

        if (existing) {
            res.status(200).json({
                message: `Workout '${achievementToBeAdded.name}' is already saved for this user.`,
            });
            return;
        }

        // Add the link in the join table
        await prisma.userAchievement.create({
            data: {
                userId: userId,
                achievementId: achievementId,
            },
        });

        res.status(200).json({
            message: `Saved ${achievementToBeAdded.name} to userId: ${userId}`,
        });
    } catch (error) {
        console.log("Unsuccessful PATCH To Save User Achievements");
        res.status(500).json({
            error: `Unsuccessful PATCH To Save User Achievements...${error}`,
        });
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
