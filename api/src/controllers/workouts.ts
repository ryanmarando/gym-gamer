import { NextFunction, Request, Response } from "express";
import { prisma } from "../config.js";
import { jwtSecret } from "../config.js";

export const getAllWorkouts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(200).json({ message: "Here's the workouts!" });
    console.log("Showing all workouts!");
};
