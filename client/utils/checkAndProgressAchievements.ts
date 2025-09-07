import * as SQLite from "expo-sqlite";
import { progressAchievementLocal } from "./progressAchievement";

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
    goalTypes: string | string[],
    context: any = {}
) {
    const db = await SQLite.openDatabaseAsync("gymgamer.db");
    const goalTypeArray = Array.isArray(goalTypes) ? goalTypes : [goalTypes];

    const active: any = await db.getAllAsync(
        `SELECT * FROM achievements
     WHERE completed = 0 AND goal_type IN (${goalTypeArray
         .map(() => "?")
         .join(",")})`,
        goalTypeArray
    );

    const newlyCompleted: any[] = [];

    for (const ach of active) {
        let goalAmount = ach.goal_amount || 1;
        let progressToAdd = 0;

        switch (ach.goal_type) {
            case "LEVEL": {
                const userLevel = context.level;
                if (userLevel >= goalAmount) {
                    progressToAdd = 100 - ach.progress;
                } else {
                    const targetProgress = Math.min(
                        100,
                        (userLevel / goalAmount) * 100
                    );
                    progressToAdd = targetProgress - ach.progress;
                }
                break;
            }
            case "QUEST":
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            case "STREAK": {
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            }
            case "WORKOUT": {
                // Duration-based achievement
                const achievementName = ach.name.toLowerCase();
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
            case "CREATION":
                const creationType = context.creationType;

                const isWorkout = checkCreationWorkoutType(creationType);
                const isQuest = checkCreationQuestType(creationType);

                if (
                    isWorkout &&
                    ach.name.toLowerCase() === "create your own workout"
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
                    ach.name.toLowerCase() === "update your first quest"
                ) {
                    if (goalAmount === 1) {
                        progressToAdd = 100;
                    } else {
                        progressToAdd = 100 / goalAmount;
                    }
                    break;
                }

                break;
            case "BODYWEIGHT":
                if (goalAmount === 1) {
                    progressToAdd = 100;
                } else {
                    progressToAdd = 100 / goalAmount;
                }
                break;
            case "LIFTINGWEIGHT":
                const sets = context.sets;
                let weight = context.weight;
                const workoutName = context.workoutName.toLowerCase();
                const previousMax = context.previousMax;
                const previousMaxWeight = previousMax?.max_weight ?? 0;
                const targetLift = ach.name.toLowerCase();

                if (
                    ach.target_value &&
                    weight >= ach.target_value &&
                    targetLift.includes(workoutName.split(" ")[0])
                ) {
                    progressToAdd = 100;
                } else if (
                    !ach.target_value &&
                    ach.name.toLowerCase().includes("personal best")
                ) {
                    if (weight > previousMaxWeight) {
                        progressToAdd = 100;
                    }
                } else if (ach.name.toLowerCase().includes("lift a total")) {
                    if (goalAmount === 1) {
                        progressToAdd = 100;
                    } else {
                        const totalLifted = Array.isArray(sets)
                            ? sets.reduce((sum, w) => sum + Number(w), 0)
                            : Number(sets);

                        progressToAdd += (totalLifted / goalAmount) * 100;
                        console.log("Lifting a total:", progressToAdd);
                    }
                }
                break;
            default:
                continue;
        }
        if (progressToAdd > 0) {
            const updated = await progressAchievementLocal(
                ach.id,
                progressToAdd
            );

            if (updated.completed) {
                newlyCompleted.push({
                    id: updated.id,
                    name: updated.name,
                    xp: updated.xp,
                });
            }
        }
    }

    return newlyCompleted;
}
