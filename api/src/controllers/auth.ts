import { NextFunction, Request, Response } from "express";
import { prisma, jwtSecret } from "../config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

        //console.log("Registered!");
        res.status(201).json(newUser);
    } catch (error) {
        console.log("Unsuccessful POST Registering User");
        res.status(500).json({
            error: `Unsuccessful POST Registering User...${error}`,
        });
    }
};

export const registerAdminUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isAdmin: true },
        });

        res.status(200).json({
            message: `User successfully updated to admin id ${updatedUser.id}`,
            user: updatedUser,
        });
    } catch (error) {
        console.log("Unsuccessful PATCH Registering Admin.");
        res.status(500).json({ message: "Failed to update user to admin." });
    }
};
