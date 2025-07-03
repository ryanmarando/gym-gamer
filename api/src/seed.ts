import { prisma } from "./config.js";
import { AchievementType } from "@prisma/client";

async function SeedWorkouts() {
    await prisma.workout.create({
        data: { name: "Bench Press" },
    });

    await prisma.workout.create({
        data: { name: "Bicep Curls" },
    });

    await prisma.workout.create({
        data: { name: "Squat" },
    });
}

async function SeedAchievements() {
    const achievements = [
        { name: "First Workout!", xp: 50, goalType: AchievementType.WORKOUT },
        { name: "One Week Streak", xp: 100, goalType: AchievementType.STREAK },
        {
            name: "5 Workouts in a Week",
            xp: 150,
            goalType: AchievementType.STREAK,
        },
        {
            name: "10 Workouts in a Month",
            xp: 250,
            goalType: AchievementType.STREAK,
        },
        {
            name: "Consistency King/Queen",
            xp: 500,
            goalType: AchievementType.STREAK,
        },
        {
            name: "Early Bird - 5 Morning Workouts",
            xp: 100,
            goalType: AchievementType.WORKOUT,
        },
        {
            name: "Leg Day Lover - 5 Leg Workouts",
            xp: 120,
            goalType: AchievementType.WORKOUT,
        },
        {
            name: "Personal Best: Bench Press",
            xp: 200,
            goalType: AchievementType.PERSONAL_BEST,
        },
        {
            name: "Personal Best: Deadlift",
            xp: 200,
            goalType: AchievementType.PERSONAL_BEST,
        },
        {
            name: "New Year, New Me - January Challenge",
            xp: 300,
            goalType: AchievementType.SEASONAL,
            isQuest: true,
        },
        { name: "Bring a Friend", xp: 75, goalType: AchievementType.SOCIAL },
        {
            name: "Fitness Journey: 100 Workouts Completed",
            xp: 1000,
            goalType: AchievementType.MILESTONE,
            isQuest: true,
        },
        {
            name: "Quest: Gain 10 lbs in 30 days.",
            xp: 1000,
            goalType: AchievementType.MILESTONE,
            isQuest: true,
        },
    ];

    for (const ach of achievements) {
        await prisma.achievement.create({
            data: {
                name: ach.name,
                xp: ach.xp,
                goalType: ach.goalType,
                isQuest: ach.isQuest ?? false, // default to false if not set
            },
        });
    }

    console.log("✅ Seeded achievements with enums!");
}

SeedAchievements();
