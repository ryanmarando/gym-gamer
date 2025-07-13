import { Prisma } from "@prisma/client";
import { progressAchievement } from "./progressAchievement.js";
import { AchievementType } from "@prisma/client";

const checkWorkoutDuration = (duration: number, achievementId: number) => {
    if (duration && duration <= 5400 && achievementId === 10) {
        // 90 min duration {
        console.log("Not enough duration in id:", achievementId);
        return false;
    }
    return true;
};

const checkWorkoutTimeOfDay = (
    workoutEndTime: string,
    achievementId: number
) => {
    console.log("Workout end time checking:", workoutEndTime);
    if (!workoutEndTime) return false;

    const endDate = new Date(workoutEndTime);
    const hour = endDate.getHours();
    console.log(`🕒 Workout ended at hour: ${hour}`);

    if (achievementId === 11 && hour < 12) {
        console.log(`✅ Matched AM workout for achievement ${achievementId}`);
        return true;
    }
    if (achievementId === 12 && hour >= 12) {
        console.log(`✅ Matched PM workout for achievement ${achievementId}`);
        return true;
    }

    console.log(
        `❌ Workout did not match AM/PM conditions for ${achievementId}`
    );
    return false;
};

const checkCreationWorkoutType = (creationType: string) => {
    if (creationType === "createWorkout") {
        console.log("found workout create true");
        return true;
    }
    return false;
};

const checkCreationQuestType = (creationType: string) => {
    if (creationType === "updateQuest") {
        return true;
    }
    return false;
};

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
    const newlyCompleted = [];

    console.log(
        `🔍 Checking ${active.length} active achievements for goal type(s): ${goalTypeArray}`
    );

    for (const ua of active) {
        let goalAmount = ua.achievement.goalAmount;
        let progressToAdd = 0;

        if (!goalAmount) {
            goalAmount = 1;
        }

        // 🎯 Example logic: figure out how much to add based on type/context
        switch (ua.achievement.goalType) {
            case AchievementType.WORKOUT: {
                // Duration-based achievement
                if (
                    ua.achievementId === 10 &&
                    !checkWorkoutDuration(context.duration, ua.achievementId)
                ) {
                    continue; // skip this achievement
                }

                // Time-of-day achievements
                if (
                    (ua.achievementId === 11 || ua.achievementId === 12) &&
                    !checkWorkoutTimeOfDay(
                        context.workoutEndTime,
                        ua.achievementId
                    )
                ) {
                    continue; // skip this achievement
                }

                // Normal progression logic
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            }
            // case AchievementType.STREAK:
            //     assessAndProgressAchievement(goalAmount, progressToAdd);
            //     break;
            case AchievementType.QUEST:
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
                break;
            case AchievementType.CREATION:
                const creationType = context.creationType;

                const isWorkout = checkCreationWorkoutType(creationType);
                const isQuest = checkCreationQuestType(creationType);

                if (isWorkout && ua.achievementId === 2) {
                    if (goalAmount === 1) {
                        progressToAdd = 100;
                    } else {
                        progressToAdd = 100 / goalAmount;
                    }
                    break;
                }

                if (isQuest && ua.achievementId === 3) {
                    if (goalAmount === 1) {
                        progressToAdd = 100;
                    } else {
                        progressToAdd = 100 / goalAmount;
                    }
                    break;
                }

                break;
            // case AchievementType.BODYWEIGHT:
            //     assessAndProgressAchievement(goalAmount, progressToAdd);
            //     break;
            // case AchievementType.LIFTINGWEIGHT:
            //     if (context.weight && context.weight > ua.progress) {
            //         progressToAdd = context.weight - ua.progress;
            //     }
            //     break;
            // case AchievementType.EXERCISE:
            //     assessAndProgressAchievement(goalAmount, progressToAdd);
            //     break;
            case AchievementType.LEVEL:
                const userLevel = context.level;

                if (userLevel >= goalAmount) {
                    progressToAdd = 100 - ua.progress;
                } else {
                    const targetProgress = Math.min(
                        100,
                        (userLevel / goalAmount) * 100
                    );
                    progressToAdd = targetProgress - ua.progress;
                }
                break;
            default:
                continue; // skip if we don't know how to handle it
        }

        if (progressToAdd > 0) {
            const updatedUA = await progressAchievement(
                tx,
                userId,
                ua.achievementId,
                progressToAdd
            );

            if (updatedUA.completed) {
                newlyCompleted.push({
                    achievementId: updatedUA.achievementId,
                    name: updatedUA.achievement.name,
                    xp: updatedUA.achievement.xp,
                });
            }
            updates.push(updatedUA);
        }
    }

    return newlyCompleted;
}
