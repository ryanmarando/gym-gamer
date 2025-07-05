import { Prisma } from "@prisma/client";
import { progressAchievement } from "./progressAchievement.js";
import { AchievementType } from "@prisma/client";

export async function checkAndProgressAchievements(
    tx: Prisma.TransactionClient,
    userId: number,
    goalTypes: AchievementType | AchievementType[],
    context: any = {}
) {
    const goalTypeArray = Array.isArray(goalTypes) ? goalTypes : [goalTypes];
    // Get all *active* UserAchievements for this user for the given goalType
    const active = await tx.userAchievement.findMany({
        where: {
            userId: userId,
            completed: false,
            achievement: {
                goalType: { in: goalTypeArray },
            },
        },
        include: {
            achievement: true,
        },
    });

    const updates = [];

    for (const ua of active) {
        let goalAmount = ua.achievement.goalAmount;
        let progressToAdd = 0;

        if (!goalAmount) {
            goalAmount = 1;
        }

        // 🎯 Example logic: figure out how much to add based on type/context
        switch (ua.achievement.goalType) {
            case AchievementType.WORKOUT:
                if (goalAmount === 1) {
                    progressToAdd = 100; // jump straight to completion
                } else {
                    progressToAdd = 100 / goalAmount; // normal increment
                }
                break;
            case AchievementType.STREAK:
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            case AchievementType.PERSONAL_BEST:
                if (context.weight && context.weight > ua.progress) {
                    progressToAdd = context.weight - ua.progress;
                }
                break;
            default:
                continue; // skip if we don't know how to handle it
        }

        if (progressToAdd > 0) {
            const updatedUser = await progressAchievement(
                tx,
                userId,
                ua.achievementId,
                progressToAdd
            );
            updates.push(updatedUser);
        }
    }

    return updates; // each user could be same or different, but you can shape this how you want
}
