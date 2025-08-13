import { Request, Response } from "express";
import { prisma } from "../config.js";

async function updateUserSubscription(
    userId: number,
    isSubscribed: boolean,
    subscriptionEndDate?: Date | null
) {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            isSubscribed,
            subscriptionEndDate: subscriptionEndDate ?? null,
        },
    });
}

export async function toggleSubscription(req: Request, res: Response) {
    const userId = Number(req.params.id);

    if (!userId) {
        res.status(400).json({ error: "Missing userId in request body" });
        return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    if (!user.isSubscribed) {
        // Was false, set true and subscriptionEndDate = now + 30 days
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 30);

        const updatedUser = await updateUserSubscription(
            userId,
            true,
            newEndDate
        );
        res.json({
            isSubscribed: updatedUser.isSubscribed,
            subscriptionEndDate: updatedUser.subscriptionEndDate,
            message: "Subscription activated for 30 days",
        });
        return;
    } else {
        // Was true, toggle off, keep date same
        const updatedUser = await updateUserSubscription(
            userId,
            false,
            user.subscriptionEndDate
        );
        res.json({
            isSubscribed: updatedUser.isSubscribed,
            subscriptionEndDate: updatedUser.subscriptionEndDate,
            message: "Subscription deactivated",
        });
        return;
    }
}
