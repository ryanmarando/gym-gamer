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

//SeedWorkouts();

export async function SeedAchievements() {
    await prisma.$executeRaw`ALTER SEQUENCE "Achievement_id_seq" RESTART WITH 1`;

    const achievements = [
        // === General Milestones ===
        {
            name: "First Workout",
            xp: 50,
            descprtion: "Complete your first workout.",
            goalAmount: 1,
            goalType: AchievementType.WORKOUT,
            weeklyReset: false,
        },
        {
            name: "Create Your Own Workout",
            xp: 75,
            descprtion: "Create a custom workout plan.",
            goalAmount: 1,
            goalType: AchievementType.WORKOUT,
            weeklyReset: false,
        },
        {
            name: "Create Your Own Quest",
            xp: 75,
            descprtion: "Create a custom quest.",
            goalAmount: 1,
            goalType: AchievementType.SEASONAL,
            weeklyReset: false,
        },
        {
            name: "Enter First Body Weight Entry",
            xp: 50,
            descprtion: "Enter your first body weight record.",
            goalAmount: 1,
            goalType: AchievementType.MILESTONE,
            weeklyReset: false,
        },
        {
            name: "Complete Your First Quest",
            xp: 100,
            descprtion: "Complete your first quest.",
            goalAmount: 1,
            goalType: AchievementType.MILESTONE,
            weeklyReset: false,
        },

        // === Workout Streaks ===
        {
            name: "3 Workouts in a Week",
            xp: 100,
            descprtion: "Complete 3 workouts in a single week.",
            goalAmount: 3,
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
            name: "Lift a Total of 10,000 lbs in a Week",
            xp: 300,
            descprtion: "Accumulate a total of 10,000 lbs lifted in a week.",
            goalAmount: 10000,
            goalType: AchievementType.STREAK,
            weeklyReset: true,
        },
        {
            name: "Do 100 Pushups in a Week",
            xp: 200,
            descprtion: "Complete 100 pushups within a week.",
            goalAmount: 100,
            goalType: AchievementType.STREAK,
            weeklyReset: true,
        },

        // === Time Challenges ===
        {
            name: "Complete a Workout Over 90 Minutes",
            xp: 150,
            descprtion:
                "Stay in the gym for over 90 minutes in a single session.",
            goalAmount: 1,
            goalType: AchievementType.WORKOUT,
            weeklyReset: true,
        },
        {
            name: "Complete 5 AM Workouts",
            xp: 150,
            descprtion: "Complete 5 workouts in the morning.",
            goalAmount: 5,
            goalType: AchievementType.WORKOUT,
            weeklyReset: true,
        },
        {
            name: "Complete 5 PM Workouts",
            xp: 150,
            descprtion: "Complete 5 workouts in the evening.",
            goalAmount: 5,
            goalType: AchievementType.WORKOUT,
            weeklyReset: true,
        },

        // === Level Milestones ===
        {
            name: "Reach Level 5",
            xp: 50,
            descprtion: "Reach level 5 in your fitness journey.",
            goalAmount: 5,
            goalType: AchievementType.MILESTONE,
            weeklyReset: false,
        },
        {
            name: "Reach Level 10",
            xp: 100,
            descprtion: "Reach level 10 in your fitness journey.",
            goalAmount: 10,
            goalType: AchievementType.MILESTONE,
            weeklyReset: false,
        },
        {
            name: "Reach Level 25",
            xp: 250,
            descprtion: "Reach level 25 in your fitness journey.",
            goalAmount: 25,
            goalType: AchievementType.MILESTONE,
            weeklyReset: false,
        },
        {
            name: "Reach Level 50",
            xp: 500,
            descprtion: "Reach level 50 in your fitness journey.",
            goalAmount: 50,
            goalType: AchievementType.MILESTONE,
            weeklyReset: false,
        },

        // === Personal Bests ===
        {
            name: "Personal Best in Any Lift",
            xp: 150,
            descprtion: "Achieve a personal best in any lift (auto-tracked).",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: true,
        },
        {
            name: "Reach a New Workout Weight Record",
            xp: 200,
            descprtion: "Hit a new personal weight record.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: true,
        },

        // === Bench Press Goals ===
        {
            name: "Bench Press 145 lbs",
            xp: 100,
            descprtion: "Bench press at least 145 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
        {
            name: "Bench Press 225 lbs",
            xp: 150,
            descprtion: "Bench press at least 225 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
        {
            name: "Bench Press 315 lbs",
            xp: 250,
            descprtion: "Bench press at least 315 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },

        // === Squat Goals ===
        {
            name: "Squat 225 lbs",
            xp: 100,
            descprtion: "Squat at least 225 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
        {
            name: "Squat 315 lbs",
            xp: 150,
            descprtion: "Squat at least 315 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
        {
            name: "Squat 405 lbs",
            xp: 250,
            descprtion: "Squat at least 405 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },

        // === Deadlift Goals ===
        {
            name: "Deadlift 315 lbs",
            xp: 100,
            descprtion: "Deadlift at least 315 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
        {
            name: "Deadlift 405 lbs",
            xp: 150,
            descprtion: "Deadlift at least 405 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
        {
            name: "Deadlift 495 lbs",
            xp: 250,
            descprtion: "Deadlift at least 495 pounds.",
            goalAmount: 1,
            goalType: AchievementType.PERSONAL_BEST,
            weeklyReset: false,
        },
    ];

    for (const ach of achievements) {
        await prisma.achievement.create({
            data: {
                name: ach.name,
                xp: ach.xp,
                descprtion: ach.descprtion ?? null,
                isQuest: false,
                deadline: null,
                goalAmount: ach.goalAmount ?? null,
                goalType: ach.goalType,
                weeklyReset: ach.weeklyReset ?? false,
            },
        });
    }

    console.log("✅ Seeded achievements with full model fields!");
}

SeedAchievements();
