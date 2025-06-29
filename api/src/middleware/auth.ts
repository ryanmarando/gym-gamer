import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config.js";

interface JwtPayload {
    id: number;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization!;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.sendStatus(401);
            return;
        }

        const token = authHeader.split(" ")[1]!;
        const decoded = jwt.verify(token, jwtSecret!) as JwtPayload;

        req.user = decoded;
        next();
    } catch (e) {
        res.sendStatus(401);
        return;
    }
};

export default auth;
