import { NextFunction, Request, Response } from "express";
import { prisma } from "../config.js";
import { addXpAndCheckLevelUp } from "../functions/addXPAndCheckLevelUp.js";
import { checkAndProgressAchievements } from "../functions/checkAndProgressAchivements.js";
import { AchievementType } from "@prisma/client";

const completedWorkoutProgress = 50;

export const getAllWorkouts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const workouts = await prisma.workout.findMany();

        if (!workouts || workouts.length <= 0) {
            res.status(404).json({ message: "No workouts found." });
            return;
        }

        res.status(200).json(workouts);
    } catch (error) {
        console.log("Unsuccessful GET of Workouts");
        res.status(500).json({
            error: `Unsuccessful GET...${error}`,
        });
    }
};

export const deleteAllWorkouts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await prisma.workout.deleteMany();

        res.status(200).json({ message: "Deleted all workouts." });
    } catch (error) {
        console.log("Unsuccessful DELETE of Workouts");
        res.status(500).json({
            error: `Unsuccessful DELETE...${error}`,
        });
    }
};

export const deleteWorkoutById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const workoutId = Number(req.params.id);

    try {
        await prisma.workout.delete({
            where: { id: workoutId },
        });

        res.status(200).json({ message: "Deleted workout id " + workoutId });
    } catch (error) {
        console.log("Unsuccessful DELETE of Workout Id" + workoutId);
        res.status(500).json({
            error: `Unsuccessful DELETE...${error}`,
        });
    }
};

export const saveToUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const workoutId = Number(req.query.workoutId);
        const userId = Number(req.query.userId);

        if (!userId) {
            console.log("Unsuccessful query... no user id.");
            res.status(400).json({ message: "Please enter a valid user id." });
            return;
        }

        const workoutToBeAdded = await prisma.workout.findFirst({
            where: { id: workoutId },
        });

        if (!workoutToBeAdded) {
            console.log("Unsuccessful query... no workout id found.");
            res.status(400).json({
                message: "Please enter a valid workout id.",
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

        const existing = await prisma.userWorkout.findFirst({
            where: {
                userId: userId,
                workoutId: workoutId,
            },
        });

        if (existing) {
            res.status(200).json({
                message: `Workout '${workoutToBeAdded.name}' is already saved for this user.`,
            });
            return;
        }

        // Add the link in the join table
        await prisma.userWorkout.create({
            data: {
                userId: userId,
                workoutId: workoutId,
            },
        });

        res.status(200).json({
            message: `Saved ${workoutToBeAdded.name} to userId: ${userId}`,
        });
        console.log("Successful Save of Workout To User");
    } catch (error) {
        console.log("Unsuccessful PATCH To Save User Workouts");
        res.status(500).json({
            error: `Unsuccessful PATCH To Save User Workouts...${error}`,
        });
    }
};

export const deleteFromUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const workoutId = Number(req.query.workoutId);
        const userId = Number(req.query.userId);

        if (!userId) {
            console.log("Unsuccessful query... no user id.");
            res.status(400).json({ message: "Please enter a valid user id." });
            return;
        }

        const workoutToBeDeleted = await prisma.workout.findFirst({
            where: { id: workoutId },
        });

        if (!workoutToBeDeleted) {
            console.log("Unsuccessful query... no workout id found.");
            res.status(400).json({
                message: "Please enter a valid workout id.",
            });
            return;
        }

        // Delete the link in the join table
        await prisma.userWorkout.delete({
            where: {
                userId_workoutId: {
                    userId: userId,
                    workoutId: workoutId,
                },
            },
        });

        res.status(200).json({
            message: `Deleted ${workoutToBeDeleted.name} from userId: ${userId}`,
        });
        return;
    } catch (error) {
        console.error("Unsuccessful DELETE of UserWorkout:", error);
        res.status(500).json({
            message:
                "An error occurred while deleting the workout from the user.",
            error: error instanceof Error ? error.message : String(error),
        });
        return;
    }
};

export const addWorkoutEntry = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const workoutId = Number(req.query.workoutId);
        const userId = Number(req.query.userId);
        let { weight } = req.body;
        weight = Number(weight);

        if (!userId || !weight) {
            console.log("Unsuccessful query... no user id and/or weight.");
            res.status(400).json({
                message: "Please enter a userId and a weight.",
            });
            return;
        }

        // Make sure the user has this workout saved
        const userWorkout = await prisma.userWorkout.findUnique({
            where: {
                userId_workoutId: {
                    userId,
                    workoutId,
                },
            },
        });

        if (!userWorkout) {
            res.status(400).json({
                message: "User does not have this workout saved.",
            });
            return;
        }

        const workoutToAddEntryOn = await prisma.workout.findFirst({
            where: { id: workoutId },
        });

        if (!workoutToAddEntryOn) {
            console.log("Unsuccessful query... no workout id found.");
            res.status(400).json({
                message: "Please enter a valid workout id.",
            });
            return;
        }

        const entry = await prisma.workoutEntry.create({
            data: {
                userId: userId,
                workoutId: workoutId,
                weight: weight,
            },
        });

        res.status(201).json({
            message: "Workout entry added successfully!",
            entry,
        });
        return;
    } catch (error) {
        console.error("Unsuccessful POST of UserWorkoutEntry:", error);
        res.status(500).json({
            message:
                "An error occurred while posting the workoutentry from the user.",
            error: error instanceof Error ? error.message : String(error),
        });
        return;
    }
};

export const deleteWorkoutEntryById = async (req: Request, res: Response) => {
    try {
        const entryId = Number(req.params.id);
        const userId = Number(req.query.userId);

        if (!entryId || !userId) {
            res.status(400).json({
                message: "Invalid entry id or user id.",
            });
            return;
        }

        // ✅ Verify it belongs to the user
        const entry = await prisma.workoutEntry.findUnique({
            where: { id: entryId },
        });

        if (!entry) {
            res.status(404).json({
                message: `Workout entry ${entryId} not found.`,
            });
            return;
        }

        if (entry.userId !== userId) {
            res.status(403).json({
                message: `Not authorized to delete entry ${entryId}.`,
            });
            return;
        }

        // Delete only if verified
        await prisma.workoutEntry.delete({
            where: { id: entryId },
        });

        res.status(200).json({
            message: `Workout entry ${entryId} deleted for user ${userId}.`,
        });
        return;
    } catch (error) {
        console.error("Error deleting workout entry:", error);
        res.status(500).json({
            message: "Failed to delete workout entry.",
            error: error instanceof Error ? error.message : String(error),
        });
        return;
    }
};

export const deleteAllEntriesForUserWorkout = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = Number(req.query.userId);
        const workoutId = Number(req.query.workoutId);

        if (!userId || !workoutId) {
            res.status(400).json({
                message: "Please provide userId and workoutId.",
            });
            return;
        }

        const deleted = await prisma.workoutEntry.deleteMany({
            where: {
                userId: userId,
                workoutId: workoutId,
            },
        });

        res.status(200).json({
            message: `Deleted ${deleted.count} entries for userId ${userId} and workoutId ${workoutId}.`,
        });
    } catch (error) {
        console.error("Error deleting all workout entries:", error);
        res.status(500).json({
            message: "Failed to delete workout entries.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

export const completeWorkout = async (req: Request, res: Response) => {
    const userId = Number(req.params.id);

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Award XP for the workout itself
            await addXpAndCheckLevelUp(userId, completedWorkoutProgress, tx);

            // 2️⃣ Progress any matching achievements
            await checkAndProgressAchievements(
                tx,
                userId,
                [AchievementType.WORKOUT, AchievementType.STREAK],
                {}
            );

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
            message: "Progress updated for completing a workout!",
            user: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong completing the workout",
        });
    }
};

export const createCustomWorkout = async (req: Request, res: Response) => {
    try {
        const { userId, customName } = req.body;

        if (
            !Number.isFinite(userId) ||
            userId <= 0 ||
            typeof customName !== "string" ||
            customName.trim() === ""
        ) {
            res.status(400).json({
                message:
                    "Please provide a valid userId number and name string.",
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ message: "Please enter a valid userId." });
            return;
        }

        const customWorkout = await prisma.workout.create({
            data: {
                name: customName,
                createdByUserId: userId,
            },
        });

        res.status(201).json({
            message: "New workout created!",
            customWorkout,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong creating a custom workout.",
        });
    }
};
