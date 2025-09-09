import { NextFunction, Request, Response } from "express";
import { prisma, resend, resendEmail } from "../config.js";

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const users = await prisma.user.findMany();

    if (!users || users.length === 0) {
        res.status(501).json({ message: "No users found." });
        return;
    }

    const sanitizedUsers = users.map(
        ({ resetCode, resetCodeExpiry, ...rest }) => rest
    );

    res.status(200).json(sanitizedUsers);
};

export const getAllUsersOptedIn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const users = await prisma.user.findMany({ where: { optedIn: true } });

    if (!users || users.length === 0) {
        res.status(501).json({ message: "No users found that are opted in." });
        return;
    }

    const sanitizedUsers = users.map(
        ({ resetCode, resetCodeExpiry, ...rest }) => rest
    );

    res.status(200).json(sanitizedUsers);
};

export const getAllSqueezeUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const users = await prisma.squeezePageUser.findMany();

    if (!users || users.length === 0) {
        res.status(501).json({ message: "No users found that are opted in." });
        return;
    }

    res.status(200).json(users);
};

export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        res.status(501).json({ message: "No user found." });
        return;
    }

    // Exclude resetCode and resetCodeExpiry
    const { resetCode, resetCodeExpiry, ...safeUser } = user;

    res.status(200).json(safeUser);
};

export const deleteAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const users = await prisma.user.deleteMany();

    res.status(200).json({ message: "Deleted all users." });
};

export const deleteUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.params.id);

    const deletedUser = await prisma.user.delete({
        where: { id: userId },
    });

    res.status(200).json({
        message: `Deleted user: ${deletedUser.name}: ${deletedUser.id}`,
    });
};

export const updateExpoToken = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const token = String(req.query.token);

    if (!userId) {
        res.status(400).json({ message: "Please enter a userId" });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // 2. Update with toggled value
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                expoPushToken: token,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating mute sounds:", error);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const sendEmail = async (req: Request, res: Response) => {
    try {
        const { fromEmail, message } = req.body;

        if (!fromEmail || !message) {
            res.status(400).json({
                message: "Please enter both a fromEmail and message",
            });
            return;
        }

        if (!resendEmail) {
            console.log("No resend email found...");
            return;
        }

        resend.emails.send({
            from: resendEmail,
            to: resendEmail,
            subject: "Requesting Support",
            text: message,
            replyTo: fromEmail,
        });
        res.status(200).json({ message: "Successfully sent support message." });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};

export const opt = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    if (!userId) {
        res.status(400).json({ message: "Please enter a userId" });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const newOptStatus = !user.optedIn;

        // 2. Update with toggled value
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                optedIn: newOptStatus,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating opted settings:", error);
        res.status(500).json({
            error: "Internal server error.",
        });
    }
};
