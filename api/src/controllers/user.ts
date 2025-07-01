import { NextFunction, Request, Response } from "express";
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
