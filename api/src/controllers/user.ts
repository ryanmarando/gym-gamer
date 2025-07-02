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
