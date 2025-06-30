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
        const workoutId = Number(req.params.id);
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
    res.status(200).json({ message: "Successfully deleted from profile!" });
    console.log("Successfully deleted from profile!");
};
