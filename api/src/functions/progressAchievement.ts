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

    if (ua.completed && ua.progress >= (ua.achievement.goalAmount || 100)) {
        console.log(
            `⚠️  Achievement '${ua.achievement.name}' for userId ${userId} is already completed.`
        );
        throw new Error("Achievement already completed");
    }

    const goal = 100;
    let newProgress = ua.progress + progressToAdd;

    console.log(
        `🔄 Progressing Achievement '${ua.achievement.name}' for userId ${userId}: +${progressToAdd}% (was ${ua.progress}%)`
    );

    if (newProgress >= goal) {
        newProgress = goal;

        await tx.userAchievement.update({
            where: {
                userId_achievementId: { userId, achievementId },
            },
            data: {
                progress: newProgress,
                completed: true,
            },
        });

        console.log(
            `🏆 Achievement '${ua.achievement.name}' COMPLETED by userId ${userId} — awarding ${ua.achievement.xp} XP!`
        );

        return addXpAndCheckLevelUp(userId, ua.achievement.xp, tx);
    } else {
        await tx.userAchievement.update({
            where: {
                userId_achievementId: { userId, achievementId },
            },
            data: {
                progress: newProgress,
            },
        });

        console.log(
            `✅ Updated progress for '${ua.achievement.name}' to ${newProgress}% for userId ${userId}`
        );

        return tx.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                xp: true,
                level: true,
                levelProgress: true,
                achievements: {
                    select: {
                        achievementId: true,
                        progress: true,
                        completed: true,
                        achievement: {
                            select: {
                                name: true,
                                xp: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
