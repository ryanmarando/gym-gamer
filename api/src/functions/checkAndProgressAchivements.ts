import { Prisma } from "@prisma/client";
import { progressAchievement } from "./progressAchievement.js";
import { AchievementType } from "@prisma/client";

const checkWorkoutDuration = (duration: number) => {
    if (duration && duration <= 5400) {
        // 90 min duration
        return false;
    }
    return true;
};

const checkWorkoutTimeOfDay = (
    localHour: number | undefined,
    achievementName: string
) => {
    if (typeof localHour !== "number") return false;
    console.log("Workout end time checking:", localHour);
    if (achievementName === "complete 5 am workouts" && localHour < 12) {
        return true;
    }

    if (achievementName === "complete 5 pm workouts" && localHour >= 12) {
        return true;
    }

    return false;
};

const checkCreationWorkoutType = (creationType: string) => {
    if (creationType === "createWorkout") {
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
                const achievementName = ua.achievement.name.toLowerCase();
                if (
                    achievementName === "complete a workout over 90 minutes" &&
                    !checkWorkoutDuration(context.duration)
                ) {
                    continue;
                }

                // Time-of-day achievements
                if (
                    (achievementName === "complete 5 am workouts" ||
                        achievementName === "complete 5 pm workouts") &&
                    !checkWorkoutTimeOfDay(context.localHour, achievementName)
                ) {
                    continue;
                }

                // Normal progression logic
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            }
            case AchievementType.STREAK: {
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            }
            case AchievementType.QUEST:
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            case AchievementType.CREATION:
                const creationType = context.creationType;

                const isWorkout = checkCreationWorkoutType(creationType);
                const isQuest = checkCreationQuestType(creationType);

                if (
                    isWorkout &&
                    ua.achievement.name.toLowerCase() ===
                        "create your own workout"
                ) {
                    if (goalAmount === 1) {
                        progressToAdd = 100;
                    } else {
                        progressToAdd = 100 / goalAmount;
                    }
                    break;
                }

                if (
                    isQuest &&
                    ua.achievement.name.toLowerCase() ===
                        "update your first quest"
                ) {
                    if (goalAmount === 1) {
                        progressToAdd = 100;
                    } else {
                        progressToAdd = 100 / goalAmount;
                    }
                    break;
                }

                break;
            case AchievementType.BODYWEIGHT:
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            case AchievementType.LIFTINGWEIGHT:
                let weight = context.weight;
                const workoutName = context.workoutName.toLowerCase();
                const previousMax = context.previousMax;
                const previousMaxWeight = previousMax?._max.weight;
                const userForWeightLifted = context?.updatedUser;
                const targetLift = ua.achievement.name.toLowerCase();
                const checkingSingleWorkoutLift =
                    context?.checkingSingleWorkoutLift;

                if (
                    ua.achievement.targetValue &&
                    weight >= ua.achievement.targetValue &&
                    targetLift.includes(workoutName.split(" ")[0]) &&
                    checkingSingleWorkoutLift
                ) {
                    progressToAdd = 100;
                } else if (
                    !ua.achievement.targetValue &&
                    ua.achievement.name.toLowerCase().includes("personal best")
                ) {
                    if (weight > previousMaxWeight) {
                        progressToAdd = 100;
                    }
                } else if (
                    ua.achievement.name
                        .toLowerCase()
                        .includes("lift a total") &&
                    userForWeightLifted
                ) {
                    if (goalAmount === 1) {
                        progressToAdd = 100;
                    } else {
                        progressToAdd += (weight / goalAmount) * 100;
                    }
                }
                break;
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
                continue;
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
