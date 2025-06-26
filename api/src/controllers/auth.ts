import { NextFunction, Request, Response } from "express";
import { prisma } from "../config.js";

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                error: "All fields are required.",
            });
            return;
        }

        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            res.status(401).json({ message: "Invalid email." });
            return;
        }

        if (!user.password) {
            res.status(401).json({
                message: "Error with account username or password",
            });
            return;
        }

        if (password !== user.password) {
            res.status(401).json({ message: "Incorrect password." });
            return;
        }

        res.status(200).json({
            message: `Successfully logged in. Welcome ${user.name}!`,
        });
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
        const { email, name, password } = req.body;
        if (!email || !name || !password) {
            res.status(400).json({
                error: "All fields are required.",
            });
            return;
        }

        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: password,
            },
        });
        console.log("Successful POST Registered User Id:", newUser.id);

        //console.log("Registered!");
        res.status(201).json(newUser);
    } catch (error) {
        console.log("Unsuccessful POST Registering User");
        res.status(500).json({
            error: `Unsuccessful POST Registering User...${error}`,
        });
    }
};

export const createAdminUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Registered an Admin!");
    res.send("Registered an Admin.");
};

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
