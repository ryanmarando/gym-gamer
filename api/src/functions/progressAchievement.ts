import { Prisma } from "@prisma/client";
import { addXpAndCheckLevelUp } from "./addXPAndCheckLevelUp.js";

export async function progressAchievement(
    tx: Prisma.TransactionClient,
    userId: number,
    achievementId: number,
    progressToAdd: number
) {
    const ua = await tx.userAchievement.findUnique({
        where: {
            userId_achievementId: { userId, achievementId },
        },
        include: { achievement: true },
    });

    if (!ua) throw new Error("UserAchievement not found");

    if (ua.completed) {
        console.log(
            `⚠️  Achievement '${ua.achievement.name}' already completed for userId ${userId}.`
        );
        return ua; // Return as-is if already done
    }

    let newProgress = ua.progress + progressToAdd;
    const goal = 100;

    let completed = false;
    if (newProgress >= goal) {
        newProgress = goal;
        completed = true;
    }

    const updatedUA = await tx.userAchievement.update({
        where: {
            userId_achievementId: { userId, achievementId },
        },
        data: {
            progress: newProgress,
            completed: completed,
        },
        include: { achievement: true },
    });

    if (completed) {
        console.log(
            `🏆 Achievement '${ua.achievement.name}' COMPLETED — awarding ${ua.achievement.xp} XP`
        );
        await addXpAndCheckLevelUp(userId, ua.achievement.xp, tx);
    } else {
        console.log(
            `✅ Progressed '${ua.achievement.name}' to ${newProgress}% for userId ${userId}`
        );
    }

    return updatedUA; // ✅ Always return the updated UserAchievement
}
