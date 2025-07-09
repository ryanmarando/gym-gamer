import { NextFunction, Request, Response } from "express";
import { WorkoutArchitype } from "@prisma/client";
import { prisma } from "../config.js";

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const users = await prisma.user.findMany();

    if (!users || users.length === 0) {
        res.status(501).json({ message: "No users found." });
    }

    res.status(200).json(users);
};

export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { weightEntries: true },
    });

    if (!user) {
        res.status(501).json({ message: "No user found." });
    }

    res.status(200).json(user);
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

export const getUserWorkoutsByArchitype = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);
    const architypeParam = req.params
        .architype as keyof typeof WorkoutArchitype;
    const architype = WorkoutArchitype[architypeParam];

    if (!architype) {
        res.status(400).json({ error: "Invalid architype" });
        return;
    }

    try {
        const workouts = await prisma.userWorkout.findMany({
            where: {
                userId: Number(userId),
                workout: {
                    architype: {
                        has: architype,
                    },
                },
            },
            include: {
                workout: true,
                entries: true,
            },
        });

        res.json({ workouts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get workouts" });
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
        res.status(500).json({
            message: "Something went wrong fetching user photos.",
            error: String(error),
        });
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

    try {
        const userQuest = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                achievements: {
                    where: {
                        achievement: {
                            isQuest: true, // ✅ filter on the related achievement
                        },
                    },
                    include: {
                        achievement: true,
                    },
                    orderBy: {
                        progress: "desc",
                    },
                    take: 1, // only one quest per user
                },
            },
        });

        res.status(200).json(userQuest);
    } catch (error) {
        console.error("Error fetching user quest:", error);
        res.status(500).json({ error: "Failed to get user quest." });
    }
};

export const resetUserStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = Number(req.params.id);

        const resetUser = await prisma.user.findFirst({
            where: { id: userId },
        });

        if (!resetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                xp: 0,
                level: 1,
                levelProgress: 0,
            },
            select: {
                id: true,
                name: true,
                xp: true,
                level: true,
                levelProgress: true,
            },
        });

        res.json({
            message: "User stats have been reset.",
            user: updatedUser,
        });

        return;
    } catch (error) {
        console.error("Error resetting user stats:", error);
        res.status(500).json({
            message: "Something went wrong resetting user stats.",
            error: String(error),
        });
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

        // Create the weight entry
        const weightEntry = await prisma.userWeightEntry.create({
            data: {
                weight: weight,
                userId: userId,
            },
        });

        res.status(201).json({
            message: "Weight entry added successfully!",
            weightEntry,
        });

        return;
    } catch (error) {
        console.error("Error adding user weight entry:", error);

        res.status(500).json({
            message: "An error occurred while adding the weight entry.",
            error: error instanceof Error ? error.message : String(error),
        });

        return;
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

        res.status(500).json({
            message: "An error occurred while GET the weight entries.",
            error: error instanceof Error ? error.message : String(error),
        });

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
                date: "desc", // your schema uses `date` mapped to created_at
            },
            include: {
                userWorkout: {
                    include: {
                        workout: true, // include workout details if you want
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
