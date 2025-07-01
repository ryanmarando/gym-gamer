import { NextFunction, Request, Response } from "express";
import { prisma } from "../config.js";
import { jwtSecret } from "../config.js";

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
    } catch (error) {
        console.log("Unsuccessful GET of Workouts");
        res.status(500).json({
            error: `Unsuccessful GET...${error}`,
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
