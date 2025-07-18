import { prisma } from "./config.js";
import { AchievementType, WorkoutArchitype } from "@prisma/client";

async function SeedWorkouts() {
    // Reset the ID sequence if needed (PostgreSQL specific)
    await prisma.$executeRaw`ALTER SEQUENCE "Workout_id_seq" RESTART WITH 1`;

    const workouts = [
        // ✅ CHEST (PUSH)
        {
            name: "Bench Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Incline Dumbbell Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Decline Bench Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Chest Fly",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Cable Crossover",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Push-Ups",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Incline Push-Up",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Dumbbell Pullover",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Machine Chest Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Pec Deck",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Single Arm Cable Fly",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Isometric Chest Squeeze",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Resistance Band Chest Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Decline Push-Up",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },
        {
            name: "Svend Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.CHEST],
        },

        // ✅ SHOULDERS (PUSH)
        {
            name: "Overhead Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Arnold Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Lateral Raise",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Front Raise",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Rear Delt Fly",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Upright Row",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Shrugs",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Single Arm Dumbbell Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Cable Face Pull",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Machine Shoulder Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Standing Military Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Plate Front Raise",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Dumbbell Y-Raise",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Seated Dumbbell Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },
        {
            name: "Landmine Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.SHOULDERS],
        },

        // ✅ ARMS (PUSH)
        {
            name: "Bicep Curls",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.ARMS],
        },
        {
            name: "Overhead Tricep Extension",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Skull Crushers",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Tricep Dips",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Close Grip Bench Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Tricep Kickback",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Cable Tricep Pushdown",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Diamond Push-Up",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "One Arm Tricep Extension",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Machine Tricep Press",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Bench Dip",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Reverse Grip Pushdown",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Barbell Overhead Extension",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "EZ Bar Skull Crusher",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Resistance Band Tricep Extension",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },
        {
            name: "Cable Overhead Tricep Extension",
            architype: [WorkoutArchitype.PUSH, WorkoutArchitype.ARMS],
        },

        // ✅ BACK (PULL)

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
            name: "T-Bar Row",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Single Arm Dumbbell Row",
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
            name: "Face Pulls",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Inverted Row",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Machine Row",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Standing T-Bar Row",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Wide Grip Row",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Close Grip Pulldown",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Reverse Fly",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },
        {
            name: "Chest Supported Row",
            architype: [WorkoutArchitype.PULL, WorkoutArchitype.BACK],
        },

        // ✅ ABS
        { name: "Crunches", architype: [WorkoutArchitype.ABS] },
        { name: "Plank", architype: [WorkoutArchitype.ABS] },
        { name: "Hanging Leg Raise", architype: [WorkoutArchitype.ABS] },
        { name: "Russian Twist", architype: [WorkoutArchitype.ABS] },
        { name: "Mountain Climbers", architype: [WorkoutArchitype.ABS] },
        { name: "Cable Crunch", architype: [WorkoutArchitype.ABS] },
        { name: "V-Ups", architype: [WorkoutArchitype.ABS] },
        { name: "Bicycle Crunch", architype: [WorkoutArchitype.ABS] },
        { name: "Reverse Crunch", architype: [WorkoutArchitype.ABS] },
        { name: "Toe Touch", architype: [WorkoutArchitype.ABS] },
        { name: "Seated In and Out", architype: [WorkoutArchitype.ABS] },
        { name: "Plank Hip Dip", architype: [WorkoutArchitype.ABS] },
        { name: "Ab Wheel Rollout", architype: [WorkoutArchitype.ABS] },
        { name: "Weighted Sit-Up", architype: [WorkoutArchitype.ABS] },
        { name: "Side Plank", architype: [WorkoutArchitype.ABS] },

        // ✅ QUADS (LEGS)
        {
            name: "Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Front Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Leg Press",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Bulgarian Split Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Walking Lunge",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Hack Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Step-Ups",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Sissy Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Goblet Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Smith Machine Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Leg Extension",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Curtsy Lunge",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Pistol Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Single Leg Press",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },
        {
            name: "Reverse Lunge",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.QUADS],
        },

        // ✅ HAMSTRINGS (LEGS)
        {
            name: "Romanian Deadlift",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Leg Curl",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Single Leg Romanian Deadlift",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Nordic Curl",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Cable Pull Through",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Stability Ball Leg Curl",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Good Morning",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Lying Leg Curl",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Seated Leg Curl",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Hip Thrust",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Reverse Hyperextension",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Banded Leg Curl",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Cable Kickback",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },
        {
            name: "Back Extension",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.HAMSTRINGS],
        },

        // ✅ GLUTES (LEGS)
        {
            name: "Hip Thrust",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Glute Bridge",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Cable Kickback",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Donkey Kicks",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Fire Hydrant",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Single Leg Hip Thrust",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Sumo Deadlift",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Cable Abduction",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Step-Ups",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Bulgarian Split Squat",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Banded Side Walk",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Lateral Lunge",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Glute Focused Back Extension",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Reverse Lunge",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },
        {
            name: "Smith Machine Hip Thrust",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.GLUTES],
        },

        // ✅ CALVES (LEGS)
        {
            name: "Standing Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Seated Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Donkey Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Single Leg Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Smith Machine Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Leg Press Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Resistance Band Calf Press",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Weighted Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Farmer Walk on Toes",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Jump Rope",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Box Jumps",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Tiptoe Walk",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Hack Squat Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Isometric Calf Hold",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
        {
            name: "Banded Seated Calf Raise",
            architype: [WorkoutArchitype.LEGS, WorkoutArchitype.CALVES],
        },
    ];

    for (const workout of workouts) {
        await prisma.workout.create({ data: workout });
    }

    console.log("✅ Seed complete with a huge library of workouts!");
}

SeedWorkouts();

export async function SeedAchievements() {
    //await prisma.$executeRaw`ALTER SEQUENCE "Achievement_id_seq" RESTART WITH 1`;

    const achievements = [
        // === General Milestones ===
        {
            name: "First Workout",
            xp: 50,
            description: "Complete your first workout.",
            goalAmount: 1,
            goalType: AchievementType.WORKOUT,
            weeklyReset: false,
        },
        {
            name: "Create Your Own Workout",
            xp: 75,
            description: "Create a custom workout plan.",
            goalAmount: 1,
            goalType: AchievementType.CREATION,
            weeklyReset: false,
        },
        {
            name: "Enter First Body Weight Entry",
            xp: 50,
            description: "Enter your first body weight record.",
            goalAmount: 1,
            goalType: AchievementType.BODYWEIGHT,
            weeklyReset: false,
        },
        {
            name: "Update Your First Quest",
            xp: 100,
            description: "Update your first quest.",
            goalAmount: 1,
            goalType: AchievementType.CREATION,
            weeklyReset: false,
        },

        // === Workout Streaks ===
        {
            name: "3 Workouts in a Week",
            xp: 100,
            description: "Complete 3 workouts in a single week.",
            goalAmount: 3,
            goalType: AchievementType.STREAK,
            weeklyReset: true,
        },
        {
            name: "5 Workouts in a Week",
            xp: 150,
            description: "Complete 5 workouts in a single week.",
            goalAmount: 5,
            goalType: AchievementType.STREAK,
            weeklyReset: true,
        },
        {
            name: "Lift a Total of 10,000 lbs in a Week",
            xp: 300,
            description: "Accumulate a total of 10,000 lbs lifted in a week.",
            goalAmount: 10000,
            goalType: AchievementType.LIFTINGWEIGHT,
            weeklyReset: true,
        },
        {
            name: "Lift a Total of 20,000 lbs in a Week",
            xp: 300,
            description: "Accumulate a total of 20,000 lbs lifted in a week.",
            goalAmount: 20000,
            goalType: AchievementType.LIFTINGWEIGHT,
            weeklyReset: true,
        },

        // === Time Challenges ===
        {
            name: "Complete a Workout Over 90 Minutes",
            xp: 150,
            description:
                "Stay in the gym for over 90 minutes in a single session.",
            goalAmount: 1,
            goalType: AchievementType.WORKOUT,
            weeklyReset: true,
        },
        {
            name: "Complete 5 AM Workouts",
            xp: 150,
            description: "Complete 5 workouts in the morning.",
            goalAmount: 5,
            goalType: AchievementType.WORKOUT,
            weeklyReset: true,
        },
        {
            name: "Complete 5 PM Workouts",
            xp: 150,
            description: "Complete 5 workouts in the evening.",
            goalAmount: 5,
            goalType: AchievementType.WORKOUT,
            weeklyReset: true,
        },

        // === Level Milestones ===
        {
            name: "Reach Level 5",
            xp: 50,
            description: "Reach level 5 in your fitness journey.",
            goalAmount: 5,
            goalType: AchievementType.LEVEL,
            weeklyReset: false,
        },
        {
            name: "Reach Level 10",
            xp: 100,
            description: "Reach level 10 in your fitness journey.",
            goalAmount: 10,
            goalType: AchievementType.LEVEL,
            weeklyReset: false,
        },
        {
            name: "Reach Level 25",
            xp: 250,
            description: "Reach level 25 in your fitness journey.",
            goalAmount: 25,
            goalType: AchievementType.LEVEL,
            weeklyReset: false,
        },
        {
            name: "Reach Level 50",
            xp: 500,
            description: "Reach level 50 in your fitness journey.",
            goalAmount: 50,
            goalType: AchievementType.LEVEL,
            weeklyReset: false,
        },

        // === Personal Bests ===
        {
            name: "Personal Best in Any Lift",
            xp: 150,
            description: "Achieve a personal best in any lift (auto-tracked).",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            weeklyReset: true,
        },

        // === Bench Press Goals ===
        {
            name: "Bench Press 45 lbs",
            xp: 100,
            description: "Bench press at least 45 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 45,
            weeklyReset: false,
        },
        {
            name: "Bench Press 135 lbs",
            xp: 100,
            description: "Bench press at least 135 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 135,
            weeklyReset: false,
        },
        {
            name: "Bench Press 225 lbs",
            xp: 150,
            description: "Bench press at least 225 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 225,
            weeklyReset: false,
        },
        {
            name: "Bench Press 315 lbs",
            xp: 250,
            description: "Bench press at least 315 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 315,
            weeklyReset: false,
        },

        // === Squat Goals ===
        {
            name: "Squat 135 lbs",
            xp: 100,
            description: "Squat at least 135 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 135,
            weeklyReset: false,
        },
        {
            name: "Squat 225 lbs",
            xp: 100,
            description: "Squat at least 225 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 225,
            weeklyReset: false,
        },
        {
            name: "Squat 315 lbs",
            xp: 150,
            description: "Squat at least 315 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 315,
            weeklyReset: false,
        },
        {
            name: "Squat 405 lbs",
            xp: 250,
            description: "Squat at least 405 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 405,
            weeklyReset: false,
        },

        // === Deadlift Goals ===
        {
            name: "Deadlift 225 lbs",
            xp: 100,
            description: "Deadlift at least 225 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 225,
            weeklyReset: false,
        },
        {
            name: "Deadlift 315 lbs",
            xp: 100,
            description: "Deadlift at least 315 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 315,
            weeklyReset: false,
        },
        {
            name: "Deadlift 405 lbs",
            xp: 150,
            description: "Deadlift at least 405 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 405,
            weeklyReset: false,
        },
        {
            name: "Deadlift 495 lbs",
            xp: 250,
            description: "Deadlift at least 495 pounds.",
            goalAmount: 1,
            goalType: AchievementType.LIFTINGWEIGHT,
            targetValue: 495,
            weeklyReset: false,
        },
    ];

    for (const ach of achievements) {
        await prisma.achievement.create({
            data: {
                name: ach.name,
                xp: ach.xp,
                description: ach.description ?? null,
                deadline: null,
                goalAmount: ach.goalAmount ?? null,
                goalType: ach.goalType,
                targetValue: ach.targetValue ?? null,
                weeklyReset: ach.weeklyReset ?? false,
            },
        });
    }

    console.log("✅ Seeded achievements with full model fields!");
}

SeedAchievements();
