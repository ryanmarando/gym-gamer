import { Request, Response, NextFunction } from "express";
import { prisma } from "../config.js"; // your Prisma client instance
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config.js";

interface JwtPayload {
    id: number;
    email: string;
    isAdmin: boolean;
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.sendStatus(401);
            return;
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret!) as JwtPayload;

        if (!decoded || !decoded.isAdmin) {
            res.sendStatus(403); // Forbidden
            return;
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.sendStatus(401);
        return;
    }
};
