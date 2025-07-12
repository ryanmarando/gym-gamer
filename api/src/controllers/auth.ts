import { NextFunction, Request, Response } from "express";
import { prisma, jwtSecret } from "../config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { assignDefaultAchievementsAndSplitToUser } from "../functions/assignDefaultAchievementsAndSplitToUser.js";

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                error: "Please enter an email.",
            });
            return;
        }

        const user = await prisma.user.findFirst({
            where: { email },
            include: { password: true },
        });

        if (!user) {
            res.status(401).json({ message: "Invalid email. No user found." });
            return;
        }

        if (!user.password?.hash) {
            res.status(401).json({
                message: "Error with account username or password",
            });
            return;
        }

        const passwordValid = await bcrypt.compare(
            req.body.password,
            user.password.hash
        );

        if (!passwordValid) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret!, {
            expiresIn: "6h",
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
        console.log("Successful login! Hi", user.name);
    } catch (error) {
        console.log("Unsuccessful Login");
        res.status(500).json({
            error: `Unsuccessful Login`,
        });
    }
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, name } = req.body;
        if (!email || !name || !req.body.password) {
            res.status(400).json({
                error: "All fields are required.",
            });
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: {
                    create: {
                        hash: hashedPassword,
                    },
                },
            },
        });
        console.log("Successful POST Registered User Id:", newUser.id);

        assignDefaultAchievementsAndSplitToUser(newUser.id);

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            jwtSecret!,
            {
                expiresIn: "6h",
            }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
        });
    } catch (error) {
        console.log("Unsuccessful POST Registering User");
        res.status(500).json({
            error: `Unsuccessful POST Registering User...${error}`,
        });
    }
};
