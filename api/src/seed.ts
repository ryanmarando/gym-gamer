import { prisma } from "./config.js";
import { AchievementType, WorkoutArchitype } from "@prisma/client";

async function SeedWorkouts() {
    // Reset the ID sequence if needed (PostgreSQL specific)
    await prisma.$executeRaw`ALTER SEQUENCE "Workout_id_seq" RESTART WITH 1`;

    const workouts = [
        // PUSH — CHEST / SHOULDERS / TRICEPS
        {
            name: "Bench Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Incline Dumbbell Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Push-Ups",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Shoulder Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Lateral Raises",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Front Raises",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Tricep Pushdown",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Overhead Tricep Extension",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },

        // PULL — BACK / BICEPS
        {
            name: "Pull-Ups",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Lat Pulldown",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Bent Over Row",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Seated Cable Row",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Deadlift",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Bicep Curls",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.ARMS],
        },
        {
            name: "Hammer Curls",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.ARMS],
        },
        {
            name: "Face Pulls",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.SHOULDERS],
        },

        // LEGS — QUADS / HAMSTRINGS / CALVES
        {
            name: "Squat",
            architype: [
                WorkoutArchitype.LEGS,
                WorkoutArchitype.QUADS,
                WorkoutArchitype.HAMSTRINGS,
                WorkoutArchitype.CALVES,
            ],
        },
        {
            name: "Leg Press",
            architype: [
                WorkoutArchitype.LEGS,
                WorkoutArchitype.QUADS,
                WorkoutArchitype.HAMSTRINGS,
            ],
        },
        {
            name: "Leg Extension",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Leg Curl",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Romanian Deadlift",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Calf Raises",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Lunges",
            architype: [
                WorkoutArchitype.LEGS,
                WorkoutArchitype.QUADS,
                WorkoutArchitype.HAMSTRINGS,
            ],
        },

        // CORE — ABS
        {
            name: "Plank",
            architype: [WorkoutArchitype.ABS],
        },
        {
            name: "Crunches",
            architype: [WorkoutArchitype.ABS],
        },
        {
            name: "Leg Raises",
            architype: [WorkoutArchitype.ABS],
        },
        {
            name: "Russian Twists",
            architype: [WorkoutArchitype.ABS],
        },

        // Combo & Functional
        {
            name: "Farmer's Walk",
            architype: [
                WorkoutArchitype.PULL,
                WorkoutArchitype.BACK,
                WorkoutArchitype.ARMS,
            ],
        },
        {
            name: "Burpees",
            architype: [
                WorkoutArchitype.PUSH,
                WorkoutArchitype.LEGS,
                WorkoutArchitype.ABS,
            ],
        },
        {
            name: "Mountain Climbers",
            architype: [WorkoutArchitype.ABS, WorkoutArchitype.LEGS],
        },
    ];

    for (const workout of workouts) {
        await prisma.workout.create({ data: workout });
    }

    console.log("✅ Seed complete with a huge library of workouts!");
}

SeedWorkouts();

export async function SeedAchievements() {
    await prisma.$executeRaw`ALTER SEQUENCE "Achievement_id_seq" RESTART WITH 1`;

    const achievements = [
        {
            name: "First Workout!",
            xp: 50,
            descprtion: "Complete your very first workout session.",
            goalAmount: 1,
            goalType: AchievementType.WORKOUT,
            weeklyReset: false,
        },
        {
            name: "One Week Streak",
            xp: 100,
            descprtion: "Work out every day for a full week.",
            goalAmount: 7,
            goalType: AchievementType.STREAK,
            weeklyReset: true,
        },
        {
            name: "5 Workouts in a Week",
            xp: 150,
            descprtion: "Complete 5 workouts in a single week.",
            goalAmount: 5,
            goalType: AchievementType.STREAK,
            weeklyReset: true,
        },
        {
            name: "10 Workouts in a Month",
            xp: 250,
            descprtion: "Complete 10 workouts within one month.",
            goalAmount: 10,
            goalType: AchievementType.STREAK,
            weeklyReset: false,
        },
        {
            name: "Consistency King/Queen",
            xp: 500,
            descprtion: "Maintain a workout streak for 30 days.",
            goalAmount: 30,
            goalType: AchievementType.STREAK,
            weeklyReset: false,
        },
        {
            name: "Early Bird - 5 Morning Workouts",
            xp: 100,
            descprtion: "Complete 5 morning workouts before 9 AM.",
            goalAmount: 5,
            goalType: AchievementType.WORKOUT,
            weeklyReset: false,
        },
        {
            name: "Leg Day Lover - 5 Leg Workouts",
            xp: 120,
            descprtion: "Smash leg day 5 times.",
            goalAmount: 5,
            goalType: AchievementType.WORKOUT,
            weeklyReset: false,
        },
        {
            name: "Personal Best: Bench Press",
            xp: 200,
            descprtion: "Set a new personal best on your bench press.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
        {
            name: "Personal Best: Deadlift",
            xp: 200,
            descprtion: "Set a new personal best on your deadlift.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
        {
            name: "New Year, New Me - January Challenge",
            xp: 300,
            descprtion: "Complete the January fitness challenge.",
            goalAmount: 20,
            goalType: AchievementType.SEASONAL,
            isQuest: true,
            weeklyReset: false,
            deadline: new Date(new Date().getFullYear(), 1, 31), // January 31st of this year
        },
        {
            name: "Bring a Friend",
            xp: 75,
            descprtion: "Invite a friend to join your workout.",
            goalAmount: 1,
            goalType: AchievementType.SOCIAL,
            weeklyReset: false,
        },
        {
            name: "Fitness Journey: 100 Workouts Completed",
            xp: 1000,
            descprtion: "Complete a total of 100 workouts.",
            goalAmount: 100,
            goalType: AchievementType.MILESTONE,
            isQuest: true,
            weeklyReset: false,
        },
        {
            name: "Quest: Gain 10 lbs in 30 days",
            xp: 1000,
            descprtion:
                "Gain 10 pounds in one month as part of your bulk journey.",
            goalAmount: 10,
            goalType: AchievementType.MILESTONE,
            isQuest: true,
            weeklyReset: false,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
    ];

    for (const ach of achievements) {
        await prisma.achievement.create({
            data: {
                name: ach.name,
                xp: ach.xp,
                descprtion: ach.descprtion ?? null,
                isQuest: ach.isQuest ?? false,
                deadline: ach.deadline ?? null,
                goalAmount: ach.goalAmount ?? null,
                goalType: ach.goalType,
                weeklyReset: ach.weeklyReset ?? false,
            },
        });
    }

    console.log("✅ Seeded achievements with full model fields!");
}

//SeedAchievements();
