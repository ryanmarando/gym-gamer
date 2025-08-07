import { NextFunction, Request, Response } from "express";
import { prisma, jwtSecret, resend, resendEmail } from "../config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { assignDefaultAchievementsAndSplitToUser } from "../functions/assignDefaultAchievementsAndSplitToUser.js";
import { isAdmin } from "../middleware/isAdmin.js";

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

        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.isAdmin },
            jwtSecret!,
            {
                expiresIn: "6h",
            }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
            },
        });
        console.log("Successful login! Hi", user.name);
    } catch (error) {
        console.log("Unsuccessful Login");
        res.status(500).json({ error: "Internal server error." });
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

        const validSystems = ["IMPERIAL", "METRIC"];
        if (!validSystems.includes(req.body.userWeightSystem)) {
            res.status(400).json({ error: "Invalid weight system." });
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        console.log("emails opted:", req.body.optedIn);
        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: {
                    create: {
                        hash: hashedPassword,
                    },
                },
                weightSystem: req.body.userWeightSystem,
                optedIn: req.body.optedIn,
            },
        });
        console.log("Successful POST Registered User Id:", newUser.id);

        assignDefaultAchievementsAndSplitToUser(
            newUser.id,
            newUser.weightSystem
        );

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin },
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
        res.status(500).json({ error: "Internal server error." });
    }
};

export const requestResetPasswordCode = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(200).json({
                message: "If that email exists, a code was sent.",
            });

            return;
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        const expiry = new Date(Date.now() + 1000 * 60 * 10); // 10 min expiry

        await prisma.user.update({
            where: { email },
            data: {
                resetCode: code,
                resetCodeExpiry: expiry,
            },
        });

        if (!resendEmail) {
            console.log("No resend email found...");
            return;
        }

        resend.emails.send({
            from: resendEmail,
            to: email,
            subject: "Your Password Reset Code",
            text: `Your Gym Gamer reset code is: ${code}`,
        });

        res.json({ message: "Reset code sent if email exists." });
    } catch (error) {
        console.log("Unsuccessful request of code...");
        res.status(500).json({ error: "Internal server error." });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, resetCode } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                email,
                resetCode: resetCode,
                resetCodeExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            res.status(400).json({ error: "Invalid or expired code" });
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
            req.body.newPassword,
            saltRounds
        );

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: {
                    update: {
                        hash: hashedPassword,
                    },
                },
                resetCode: null,
                resetCodeExpiry: null,
            },
        });

        res.json({ message: "Password reset successful." });
    } catch (error) {
        console.log("Unsuccessful reset password...");
        res.status(500).json({ error: "Internal server error." });
    }
};

export const createSqueezeUser = async (req: Request, res: Response) => {
    const { email, name } = req.body;
    if (!email || !name) {
        res.status(400).json({
            error: "All fields are required.",
        });
        return;
    }

    try {
        const existingUser = await prisma.squeezePageUser.findFirst({
            where: {
                email: email,
                name: name,
            },
        });

        if (!existingUser) {
            await prisma.squeezePageUser.create({
                data: {
                    email: email,
                    name: name,
                },
            });
        }

        if (!resendEmail) {
            console.log("No resend email found...");
            return;
        }

        resend.emails.send({
            from: resendEmail,
            to: email,
            subject: "Your Gym Gamer Plan Is Here!",
            html: `
              <div style="font-family: sans-serif; font-size: 16px; color: #333;">
                <h1>Your Gym Gamer Plan Is Here! 💪</h1>
                <p>Hey there, ${name}!</p>
                <p>Here’s your gym gamering workout plan with 3 simple workout splits:</p>
                <ul>
                  <li>🏋️‍♂️ Chest, Shoulders, & Triceps on Monday</li>
                  <li>🦵 Legs on Wednesday</li>
                  <li>💪 Back & Biceps on Friday</li>
                </ul>
                <p>Chest/Shoulders/Tricep Day:</p>
                <ul>
                  <li>Bench Press</li>
                  <li>Lateral Raises</li>
                  <li>Tricep Pushdowns</li>
                </ul>
                <p>💡Tips to keep you on track and gamify the experience:</p>
                <ol>
                  <li>Write down in your notes app the weight you lifted for each workout and how many reps you did</li>
                  <li>Take a photo of yourself so you can track your progress (even if it feels cringe)</li>
                  <li>The easiest way to start is drinking a scoop of protein powder after a workout. Ideally you eat a little under 1 g of protein per lb of bodyweight...</li>
                </ol>
                <p>Keep grinding — you got this!</p>
                <p>– The Gym Gamer Team</p>
              </div>
            `,
        });

        res.status(200).json({ message: "Added user to squeeze" });
    } catch (error) {
        console.log(
            "Unsuccessful creation of squeeze user and/or sending items..."
        );
        res.status(500).json({ error: "Internal server error." });
    }
};

export const deleteSqueezeUserByEmail = async (req: Request, res: Response) => {
    const email = req.params.email;
    if (!email) {
        res.status(400).json({
            error: "No userId provided.",
        });
        return;
    }

    try {
        await prisma.squeezePageUser.delete({
            where: {
                email: email,
            },
        });

        res.status(200).json({ message: "Removed user " + email });
    } catch (error) {
        console.log("Unsuccessful delete squeeze user ...");
        res.status(500).json({ error: "Internal server error." });
    }
};
