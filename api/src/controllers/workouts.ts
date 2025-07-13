import { NextFunction, Request, Response } from "express";
import { prisma } from "../config.js";
import { addXpAndCheckLevelUp } from "../functions/addXPAndCheckLevelUp.js";
import { checkAndProgressAchievements } from "../functions/checkAndProgressAchivements.js";
import { AchievementType } from "@prisma/client";

const completedWorkoutProgress = 70000;

export const getAllWorkouts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const all = req.query.all !== "false";
        const userId = req.query.userId;

        if (!all && !userId) {
            res.status(400).json({
                message: "Missing userId when 'all' is false.",
            });
            return;
        }

        let workouts;

        if (all) {
            workouts = await prisma.workout.findMany();
        } else {
            workouts = await prisma.workout.findMany({
                where: {
                    OR: [
                        { createdByUserId: null },
                        { createdByUserId: Number(userId) },
                    ],
                },
            });
        }

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
        const dayId = req.body.dayId ? Number(req.body.dayId) : undefined;

        if (!userId || !workoutId) {
            res.status(400).json({ message: "Missing userId or workoutId" });
            return;
        }

        const workoutToBeAdded = await prisma.workout.findUnique({
            where: { id: workoutId },
        });

        if (!workoutToBeAdded) {
            res.status(400).json({ message: "Invalid workoutId" });
            return;
        }

        const existing = await prisma.userWorkout.findFirst({
            where: {
                userId,
                workoutId,
            },
        });

        if (existing) {
            res.status(200).json({ message: "Workout already saved." });
            return;
        }

        await prisma.userWorkout.create({
            data: {
                userId,
                workoutId,
                dayId: dayId || null, // ✅ use provided dayId if present
            },
        });

        res.status(200).json({
            message: `Saved ${workoutToBeAdded.name} to userId ${userId} ${
                dayId ? `on dayId ${dayId}` : ""
            }`,
        });
    } catch (error) {
        console.log("Unsuccessful PATCH:", error);
        res.status(500).json({ error: `Save failed: ${error}` });
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
    const { duration, workoutEndTime } = req.body;
    let newlyCompleted;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Award XP for the workout itself
            const levelUpResult = await addXpAndCheckLevelUp(
                userId,
                completedWorkoutProgress,
                tx
            );

            // 2️⃣ Progress any matching achievements
            const workoutAndStreakAchievements =
                await checkAndProgressAchievements(
                    tx,
                    userId,
                    [AchievementType.WORKOUT, AchievementType.STREAK],
                    { duration, workoutEndTime }
                );

            newlyCompleted = [
                ...(levelUpResult.newlyCompletedAchievements || []),
                ...(workoutAndStreakAchievements || []),
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
            message: "Progress updated for completing a workout!",
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

export const createCustomWorkout = async (req: Request, res: Response) => {
    try {
        const { userId, customName, architype } = req.body;

        if (
            !Number.isFinite(userId) ||
            userId <= 0 ||
            typeof customName !== "string" ||
            customName.trim() === "" ||
            !architype
        ) {
            res.status(400).json({
                message:
                    "Please provide a valid userId number, name string, and an architype.",
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

        const result = await prisma.$transaction(async (tx) => {
            const customWorkout = await tx.workout.create({
                data: {
                    name: customName.trim(),
                    createdByUserId: userId,
                    architype: architype,
                },
            });

            // ✅ Progress any CREATION-type achievements for this user
            const newlyCompletedAchievements =
                await checkAndProgressAchievements(
                    tx,
                    userId,
                    AchievementType.CREATION,
                    { creationType: "createWorkout" }
                );

            return { customWorkout, newlyCompletedAchievements };
        });

        res.status(201).json({
            message: "New workout created!",
            workout: result.customWorkout,
            newlyCompletedAchievements: result.newlyCompletedAchievements,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong creating a custom workout.",
        });
    }
};

export const assignWorkoutSplit = async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const { days } = req.body as { days: string[] };

    if (!days || days.length === 0) {
        res.status(400).json({
            error: "Please provide an array of day names.",
        });
        return;
    }

    // 1. Ensure workoutSplit exists
    await prisma.user.update({
        where: { id: userId },
        data: {
            workoutSplit: {
                connectOrCreate: {
                    where: { userId },
                    create: {},
                },
            },
        },
    });

    const split = await prisma.workoutSplit.findUnique({
        where: { userId },
        include: { days: true },
    });
    if (!split) {
        res.status(500).json({
            error: "WorkoutSplit not found after creation",
        });
        return;
    }

    const existingDayNames = split.days.map((d) => d.dayName.toLowerCase());
    const daysToAdd = days.filter(
        (d) => !existingDayNames.includes(d.toLowerCase())
    );

    const newDayNamesLower = days.map((d) => d.toLowerCase());
    const daysToDeleteIds = split.days
        .filter((d) => !newDayNamesLower.includes(d.dayName.toLowerCase()))
        .map((d) => d.id);

    if (daysToAdd.length > 0) {
        await prisma.workoutDay.createMany({
            data: daysToAdd.map((dayName, idx) => ({
                dayIndex: split.days.length + idx + 1,
                dayName,
                splitId: split.id,
            })),
        });
    }

    if (daysToDeleteIds.length > 0) {
        await prisma.workoutDay.deleteMany({
            where: { id: { in: daysToDeleteIds } },
        });
    }

    const updatedSplit = await prisma.workoutSplit.findUnique({
        where: { userId },
        include: { days: true },
    });

    res.status(200).json({
        message: "Workout split updated!",
        split: updatedSplit,
    });
    return;
};
