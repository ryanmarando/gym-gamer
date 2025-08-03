import { NextFunction, Request, Response } from "express";
import { prisma, resend, resendEmail } from "../config.js";
import { AchievementType } from "@prisma/client";
import { checkAndProgressAchievements } from "../functions/checkAndProgressAchivements.js";
import { WeightSystem } from "@prisma/client";

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const users = await prisma.user.findMany();

    if (!users || users.length === 0) {
        res.status(501).json({ message: "No users found." });
        return;
    }

    const sanitizedUsers = users.map(
        ({ resetCode, resetCodeExpiry, ...rest }) => rest
    );

    res.status(200).json(sanitizedUsers);
};

export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            weightEntries: true,
            workoutSplit: {
                include: {
                    days: true,
                },
            },
        },
    });

    if (!user) {
        res.status(501).json({ message: "No user found." });
        return;
    }

    // Exclude resetCode and resetCodeExpiry
    const { resetCode, resetCodeExpiry, ...safeUser } = user;

    res.status(200).json(safeUser);
};

export const deleteAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const users = await prisma.user.deleteMany();

    res.status(200).json({ message: "Deleted all users." });
};

export const getUserWorkouts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);

    const userWithWorkouts = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            workouts: {
                include: {
                    workout: true,
                    entries: true,
                },
            },
        },
    });

    res.status(200).json(userWithWorkouts);
};

export const getUserWorkoutsBySplit = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.query.userId);
    const splitId = Number(req.query.splitId);

    if (!splitId || !userId) {
        res.status(200).json({ message: "No split and/or user Id entered..." });
        return;
    }

    try {
        let workouts = await prisma.userWorkout.findMany({
            where: {
                userId,
            },
            include: {
                workout: true,
                day: true,
                entries: true,
            },
        });

        workouts = workouts.filter((w) => w.dayId === splitId);

        res.json({ workouts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const getAllUserPhotos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = Number(req.params.id);

        const user = await prisma.user.findFirst({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({
                message: "No user found. Please enter a valid userId.",
            });
            return;
        }

        const progressPhotos = await prisma.progressPhoto.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc" },
        });

        if (!progressPhotos || progressPhotos.length === 0) {
            res.status(404).json({ message: "No photos found." });
            return;
        }

        res.status(200).json({ progressPhotos });
    } catch (error) {
        console.error("Error fetching user photos:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const getUserAchievements = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);

    const userWithAchievements = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            achievements: {
                include: {
                    achievement: true,
                },
                orderBy: {
                    progress: "desc",
                },
            },
        },
    });

    res.status(200).json(userWithAchievements);
};

export const getUserQuest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }

    try {
        const userQuest = await prisma.quest.findFirst({
            where: { userId },
        });

        res.status(200).json({
            userId,
            quest: userQuest ?? null,
        });
    } catch (error) {
        console.error("Error fetching user quest:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const resetUserStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = Number(req.params.id);

        const userExists = await prisma.user.findFirst({
            where: { id: userId },
        });

        if (!userExists) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // ✅ Wrap everything in a transaction for safety
        const updated = await prisma.$transaction(async (tx) => {
            // 1) Reset user stats
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    xp: 0,
                    level: 1,
                    levelProgress: 0,
                    totalWeightLifted: 0,
                    weeklyWeightLifted: 0,
                },
                select: {
                    id: true,
                    name: true,
                    xp: true,
                    level: true,
                    levelProgress: true,
                },
            });

            // 2) Reset all user achievements
            await tx.userAchievement.updateMany({
                where: { userId },
                data: {
                    progress: 0,
                    completed: false,
                },
            });

            return updatedUser;
        });

        res.json({
            message: "User stats and achievements have been reset.",
            user: updated,
        });

        return;
    } catch (error) {
        console.error("Error resetting user stats:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const addUserWeightEntry = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        let { weight } = req.body;

        weight = Number(weight);

        if (!userId || isNaN(weight)) {
            res.status(400).json({
                message: "Please provide a valid userId and weight.",
            });
            return;
        }

        // Confirm user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({
                message: "User not found.",
            });
            return;
        }

        let newlyCompletedAchievements;

        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Create weight entry
            const weightEntry = await tx.userWeightEntry.create({
                data: {
                    weight,
                    userId,
                },
            });

            // 2️⃣ Progress any matching achievements (e.g., for logging weight)
            const completedAchievements = await checkAndProgressAchievements(
                tx,
                userId,
                [AchievementType.BODYWEIGHT]
            );

            newlyCompletedAchievements = completedAchievements || [];

            return {
                weightEntry,
            };
        });

        res.status(201).json({
            message: "Weight entry added successfully!",
            weightEntry: result.weightEntry,
            newlyCompletedAchievements,
        });
    } catch (error) {
        console.error("Error adding user weight entry:", error);

        res.status(500).json({ error: "Internal server error." });
    }
};

export const getAllUserWeightEntries = async (req: Request, res: Response) => {
    const userId = Number(req.params.id);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                weightEntries: {
                    orderBy: {
                        enteredAt: "desc",
                    },
                },
            },
        });

        res.status(200).json({
            user: {
                id: user?.id,
                name: user?.name,
                weightEntries: user?.weightEntries,
            },
        });
    } catch (error) {
        console.error("Error GET user weight entries:", error);

        res.status(500).json({ error: "Internal server error." });
        return;
    }
};

export const getUserWorkoutWeightEntries = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = Number(req.params.id);
        if (!userId || isNaN(userId)) {
            res.status(400).json({ message: "Invalid or missing userId" });
            return;
        }

        const entries = await prisma.workoutEntry.findMany({
            where: { userId },
            orderBy: {
                date: "desc",
            },
            include: {
                userWorkout: {
                    include: {
                        workout: true,
                    },
                },
            },
        });

        res.status(200).json({ entries });
    } catch (error) {
        console.error("❌ Failed to get user workout entries:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteLastUserWeightEntry = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = parseInt(req.params.id);

    try {
        // 1️⃣ Find the most recent weight entry for this user
        const lastEntry = await prisma.userWeightEntry.findFirst({
            where: { userId },
            orderBy: { enteredAt: "desc" }, // latest first
        });

        if (!lastEntry) {
            res.status(404).json({
                message: `No weight entries found for user ${userId}.`,
            });
            return;
        }

        // 2️⃣ Delete the most recent entry
        await prisma.userWeightEntry.delete({
            where: { id: lastEntry.id },
        });

        res.status(200).json({
            message: `Deleted the most recent weight entry with ID ${lastEntry.id} for user ${userId}.`,
        });
    } catch (error) {
        console.error("Error deleting last weight entry:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const deleteAllUserWeightEntries = async (
    req: Request,
    res: Response
) => {
    const userId = parseInt(req.params.id);

    try {
        // Delete all weight entries for the given userId
        const deleted = await prisma.userWeightEntry.deleteMany({
            where: {
                userId: userId,
            },
        });

        res.status(200).json({
            message: `Deleted ${deleted.count} weight entries for user ${userId}.`,
        });
    } catch (error) {
        console.error("Error deleting weight entries:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const updateWeightSystem = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const rawWeightSystem = req.query.weightSystem;

    // Validate and convert to string (if possible)
    if (typeof rawWeightSystem !== "string") {
        res.status(400).json({ message: "Invalid weight system." });
        return;
    }

    // Validate enum value
    if (
        !Object.values(WeightSystem).includes(rawWeightSystem as WeightSystem)
    ) {
        res.status(400).json({ message: "Invalid weight system." });
        return;
    }

    const newWeightSystem = rawWeightSystem as WeightSystem;

    if (!newWeightSystem) {
        res.status(400).json({ message: "Please enter a new weight system." });
        return;
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                weightSystem: newWeightSystem,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating weight system:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const updateMuteSounds = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    if (!userId) {
        res.status(400).json({ message: "Please enter a userId" });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { muteSounds: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // 2. Update with toggled value
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                muteSounds: !user.muteSounds,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating mute sounds:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const deleteUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);

    const deletedUser = await prisma.user.delete({
        where: { id: userId },
    });

    res.status(200).json({
        message: `Deleted user: ${deletedUser.name}: ${deletedUser.id}`,
    });
};

export const updateExpoToken = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const token = String(req.query.token);

    if (!userId) {
        res.status(400).json({ message: "Please enter a userId" });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // 2. Update with toggled value
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                expoPushToken: token,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating mute sounds:", error);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const sendEmail = async (req: Request, res: Response) => {
    try {
        const { fromEmail, message } = req.body;

        if (!fromEmail || !message) {
            res.status(400).json({
                message: "Please enter both a fromEmail and message",
            });
            return;
        }

        if (!resendEmail) {
            console.log("No resend email found...");
            return;
        }

        resend.emails.send({
            from: resendEmail,
            to: resendEmail,
            subject: "Requesting Support",
            text: message,
            replyTo: fromEmail,
        });
        res.status(200).json({ message: "Successfully sent support message." });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};
