import * as SQLite from "expo-sqlite";

export async function seedWorkouts(db: any) {
    const workouts = [
        // ✅ "CHEST" ("PUSH")
        {
            name: "Bench Press",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Incline Dumbbell Press",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Decline Bench Press",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Chest Fly",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Cable Crossover",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Push-Ups",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Incline Push-Up",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Dumbbell Pullover",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Machine Chest Press",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Pec Deck",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Single Arm Cable Fly",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Isometric Chest Squeeze",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Resistance Band Chest Press",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Decline Push-Up",
            architype: ["PUSH", "CHEST"],
        },
        {
            name: "Svend Press",
            architype: ["PUSH", "CHEST"],
        },

        // ✅ "SHOULDERS" ("PUSH")
        {
            name: "Overhead Press",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Arnold Press",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Lateral Raise",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Front Raise",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Rear Delt Fly",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Upright Row",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Shrugs",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Single Arm Dumbbell Press",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Cable Face Pull",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Machine Shoulder Press",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Standing Military Press",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Plate Front Raise",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Dumbbell Y-Raise",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Seated Dumbbell Press",
            architype: ["PUSH", "SHOULDERS"],
        },
        {
            name: "Landmine Press",
            architype: ["PUSH", "SHOULDERS"],
        },

        // ✅ "ARMS" ("PUSH")
        {
            name: "Bicep Curls",
            architype: ["PULL", "ARMS"],
        },
        {
            name: "Overhead Tricep Extension",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Skull Crushers",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Tricep Dips",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Close Grip Bench Press",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Tricep Kickback",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Cable Tricep Pushdown",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Diamond Push-Up",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "One Arm Tricep Extension",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Machine Tricep Press",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Bench Dip",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Reverse Grip Pushdown",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Barbell Overhead Extension",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "EZ Bar Skull Crusher",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Resistance Band Tricep Extension",
            architype: ["PUSH", "ARMS"],
        },
        {
            name: "Cable Overhead Tricep Extension",
            architype: ["PUSH", "ARMS"],
        },

        // ✅ "BACK" ("PULL")

        {
            name: "Pull-Ups",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Lat Pulldown",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Bent Over Row",
            architype: ["PULL", "BACK"],
        },
        {
            name: "T-Bar Row",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Single Arm Dumbbell Row",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Seated Cable Row",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Deadlift",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Face Pulls",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Inverted Row",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Machine Row",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Standing T-Bar Row",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Wide Grip Row",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Close Grip Pulldown",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Reverse Fly",
            architype: ["PULL", "BACK"],
        },
        {
            name: "Chest Supported Row",
            architype: ["PULL", "BACK"],
        },

        // ✅ "ABS"
        { name: "Crunches", architype: ["ABS"] },
        { name: "Plank", architype: ["ABS"] },
        { name: "Hanging Leg Raise", architype: ["ABS"] },
        { name: "Russian Twist", architype: ["ABS"] },
        { name: "Mountain Climbers", architype: ["ABS"] },
        { name: "Cable Crunch", architype: ["ABS"] },
        { name: "V-Ups", architype: ["ABS"] },
        { name: "Bicycle Crunch", architype: ["ABS"] },
        { name: "Reverse Crunch", architype: ["ABS"] },
        { name: "Toe Touch", architype: ["ABS"] },
        { name: "Seated In and Out", architype: ["ABS"] },
        { name: "Plank Hip Dip", architype: ["ABS"] },
        { name: "Ab Wheel Rollout", architype: ["ABS"] },
        { name: "Weighted Sit-Up", architype: ["ABS"] },
        { name: "Side Plank", architype: ["ABS"] },

        // ✅ "QUADS" ("LEGS")
        {
            name: "Squat",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Front Squat",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Leg Press",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Bulgarian Split Squat",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Walking Lunge",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Hack Squat",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Step-Ups",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Sissy Squat",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Goblet Squat",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Smith Machine Squat",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Leg Extension",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Curtsy Lunge",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Pistol Squat",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Single Leg Press",
            architype: ["LEGS", "QUADS"],
        },
        {
            name: "Reverse Lunge",
            architype: ["LEGS", "QUADS"],
        },

        // ✅ "HAMSTRINGS" ("LEGS")
        {
            name: "Romanian Deadlift",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Leg Curl",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Single Leg Romanian Deadlift",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Nordic Curl",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Cable Pull Through",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Stability Ball Leg Curl",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Good Morning",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Lying Leg Curl",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Seated Leg Curl",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Hip Thrust",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Reverse Hyperextension",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Banded Leg Curl",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Cable Kickback",
            architype: ["LEGS", "HAMSTRINGS"],
        },
        {
            name: "Back Extension",
            architype: ["LEGS", "HAMSTRINGS"],
        },

        // ✅ "GLUTES" ("LEGS")
        {
            name: "Hip Thrust",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Glute Bridge",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Cable Kickback",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Donkey Kicks",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Fire Hydrant",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Single Leg Hip Thrust",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Sumo Deadlift",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Cable Abduction",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Step-Ups",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Bulgarian Split Squat",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Banded Side Walk",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Lateral Lunge",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Glute Focused Back Extension",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Reverse Lunge",
            architype: ["LEGS", "GLUTES"],
        },
        {
            name: "Smith Machine Hip Thrust",
            architype: ["LEGS", "GLUTES"],
        },

        // ✅ "CALVES" ("LEGS")
        {
            name: "Standing Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Seated Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Donkey Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Single Leg Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Smith Machine Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Leg Press Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Resistance Band Calf Press",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Weighted Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Farmer Walk on Toes",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Jump Rope",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Box Jumps",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Tiptoe Walk",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Hack Squat Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Isometric Calf Hold",
            architype: ["LEGS", "CALVES"],
        },
        {
            name: "Banded Seated Calf Raise",
            architype: ["LEGS", "CALVES"],
        },
    ];

    try {
        for (const workout of workouts) {
            await db.runAsync(
                `INSERT OR IGNORE INTO workouts (name, architype) VALUES (?, ?);`,
                [workout.name, JSON.stringify(workout.architype)]
            );
        }
    } catch (error) {
        console.log(`Unsuccessful creation of workouts: ${error}`);
    }

    console.log("✅ Seed complete with a huge library of workouts!");
}

export async function seedAchievements(db: any) {
    const achievements = [
        // === General Milestones ===
        {
            name: "First Workout",
            xp: 50,
            description: "Complete your first workout.",
            goalAmount: 1,
            goalType: "WORKOUT",
            weeklyReset: false,
        },
        {
            name: "Create Your Own Workout",
            xp: 75,
            description: "Create a custom workout plan.",
            goalAmount: 1,
            goalType: "CREATION",
            weeklyReset: false,
        },
        {
            name: "Enter First Body Weight Entry",
            xp: 50,
            description: "Enter your first body weight record.",
            goalAmount: 1,
            goalType: "BODYWEIGHT",
            weeklyReset: false,
        },
        {
            name: "Update Your First Quest",
            xp: 100,
            description: "Update your first quest.",
            goalAmount: 1,
            goalType: "CREATION",
            weeklyReset: false,
        },

        // === Workout Streaks ===
        {
            name: "3 Workouts in a Week",
            xp: 100,
            description: "Complete 3 workouts in a single week.",
            goalAmount: 3,
            goalType: "STREAK",
            weeklyReset: true,
        },
        {
            name: "5 Workouts in a Week",
            xp: 150,
            description: "Complete 5 workouts in a single week.",
            goalAmount: 5,
            goalType: "STREAK",
            weeklyReset: true,
        },
        {
            name: "Lift a Total of 10,000 lbs in a Week",
            xp: 300,
            description: "Accumulate a total of 10,000 lbs lifted in a week.",
            goalAmount: 10000,
            goalType: "LIFTINGWEIGHT",
            weeklyReset: true,
        },
        {
            name: "Lift a Total of 20,000 lbs in a Week",
            xp: 300,
            description: "Accumulate a total of 20,000 lbs lifted in a week.",
            goalAmount: 20000,
            goalType: "LIFTINGWEIGHT",
            weeklyReset: true,
        },

        // === Time Challenges ===
        {
            name: "Complete a Workout Over 90 Minutes",
            xp: 150,
            description:
                "Stay in the gym for over 90 minutes in a single session.",
            goalAmount: 1,
            goalType: "WORKOUT",
            weeklyReset: true,
        },
        {
            name: "Complete 5 AM Workouts",
            xp: 150,
            description: "Complete 5 workouts in the morning.",
            goalAmount: 5,
            goalType: "WORKOUT",
            weeklyReset: true,
        },
        {
            name: "Complete 5 PM Workouts",
            xp: 150,
            description: "Complete 5 workouts in the evening.",
            goalAmount: 5,
            goalType: "WORKOUT",
            weeklyReset: true,
        },

        // === Level Milestones ===
        {
            name: "Reach Level 5",
            xp: 50,
            description: "Reach level 5 in your fitness journey.",
            goalAmount: 5,
            goalType: "LEVEL",
            weeklyReset: false,
        },
        {
            name: "Reach Level 10",
            xp: 100,
            description: "Reach level 10 in your fitness journey.",
            goalAmount: 10,
            goalType: "LEVEL",
            weeklyReset: false,
        },
        {
            name: "Reach Level 25",
            xp: 250,
            description: "Reach level 25 in your fitness journey.",
            goalAmount: 25,
            goalType: "LEVEL",
            weeklyReset: false,
        },
        {
            name: "Reach Level 50",
            xp: 500,
            description: "Reach level 50 in your fitness journey.",
            goalAmount: 50,
            goalType: "LEVEL",
            weeklyReset: false,
        },

        // === Personal Bests ===
        {
            name: "Personal Best in Any Lift",
            xp: 150,
            description: "Achieve a personal best in any lift (auto-tracked).",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            weeklyReset: true,
        },

        // === Bench Press Goals ===
        {
            name: "Bench Press 45 lbs",
            xp: 100,
            description: "Bench press at least 45 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 45,
            weeklyReset: false,
        },
        {
            name: "Bench Press 135 lbs",
            xp: 100,
            description: "Bench press at least 135 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 135,
            weeklyReset: false,
        },
        {
            name: "Bench Press 225 lbs",
            xp: 150,
            description: "Bench press at least 225 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 225,
            weeklyReset: false,
        },
        {
            name: "Bench Press 315 lbs",
            xp: 250,
            description: "Bench press at least 315 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 315,
            weeklyReset: false,
        },

        // === Squat Goals ===
        {
            name: "Squat 135 lbs",
            xp: 100,
            description: "Squat at least 135 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 135,
            weeklyReset: false,
        },
        {
            name: "Squat 225 lbs",
            xp: 100,
            description: "Squat at least 225 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 225,
            weeklyReset: false,
        },
        {
            name: "Squat 315 lbs",
            xp: 150,
            description: "Squat at least 315 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 315,
            weeklyReset: false,
        },
        {
            name: "Squat 405 lbs",
            xp: 250,
            description: "Squat at least 405 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 405,
            weeklyReset: false,
        },

        // === Deadlift Goals ===
        {
            name: "Deadlift 225 lbs",
            xp: 100,
            description: "Deadlift at least 225 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 225,
            weeklyReset: false,
        },
        {
            name: "Deadlift 315 lbs",
            xp: 100,
            description: "Deadlift at least 315 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 315,
            weeklyReset: false,
        },
        {
            name: "Deadlift 405 lbs",
            xp: 150,
            description: "Deadlift at least 405 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 405,
            weeklyReset: false,
        },
        {
            name: "Deadlift 495 lbs",
            xp: 250,
            description: "Deadlift at least 495 pounds.",
            goalAmount: 1,
            goalType: "LIFTINGWEIGHT",
            targetValue: 495,
            weeklyReset: false,
        },
    ];

    try {
        for (const ach of achievements) {
            await db.runAsync(
                `INSERT OR IGNORE INTO achievements 
                (name, xp, description, goal_amount, goal_type, weekly_reset, target_value)
                VALUES (?, ?, ?, ?, ?, ?, ?);`,
                [
                    ach.name,
                    ach.xp,
                    ach.description || null,
                    ach.goalAmount ?? null,
                    ach.goalType,
                    ach.weeklyReset ? 1 : 0,
                    ach.targetValue ?? null,
                ]
            );
        }
    } catch (error) {
        console.log(`Unsuccessful seeding of achievements: ${error}`);
    }

    console.log("✅ Seeded achievements with full model fields!");
}

export async function seedWorkoutSplits(db: any, userId: number) {
    // 1️⃣ Ensure the split exists for this user
    const splitRow: any = await db.getFirstAsync(
        `SELECT id FROM workout_splits WHERE user_id = ?`,
        [userId]
    );

    let splitId: number;
    if (splitRow) {
        splitId = splitRow.id;
    } else {
        const result: any = await db.runAsync(
            `INSERT INTO workout_splits (user_id) VALUES (?)`,
            [userId]
        );
        splitId = result.lastInsertRowId;
    }

    // 2️⃣ Default days
    const defaultDays = ["PUSH", "PULL", "LEGS"];

    // 3️⃣ Get existing days to avoid duplicates
    const existingDaysRows: any[] = await db.getAllAsync(
        `SELECT day_name FROM workout_days WHERE split_id = ?`,
        [splitId]
    );
    const existingDayNames = new Set(
        existingDaysRows.map((d) => d.day_name.toUpperCase())
    );

    // 4️⃣ Insert missing days
    let dayIndex = existingDaysRows.length; // continue numbering
    for (const dayName of defaultDays) {
        if (!existingDayNames.has(dayName)) {
            await db.runAsync(
                `INSERT INTO workout_days (day_index, day_name, split_id) VALUES (?, ?, ?)`,
                [dayIndex, dayName, splitId]
            );
            dayIndex++;
        }
    }

    console.log(`✅ Workout split seeded for user ${userId}`);
}

export async function seedQuest(db: any, userId: number) {
    const goalDate = new Date();
    goalDate.setDate(goalDate.getDate() + 30);
    const goalValue = 10;
    const unit = "lbs";
    const name = `Gain ${goalValue} ${unit} by ${goalDate.toLocaleDateString()}`;

    // Check if a quest already exists for the user
    const existingQuest = await db.getFirstAsync(
        `SELECT id FROM quests WHERE user_id = ?`,
        [userId]
    );

    if (existingQuest) {
        // Update existing quest
        await db.runAsync(
            `UPDATE quests
             SET type = ?, goal = ?, goal_date = ?, name = ?, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            ["GAIN", goalValue, goalDate.toISOString(), name, userId]
        );
    } else {
        // Insert new quest
        await db.runAsync(
            `INSERT INTO quests (user_id, type, goal, goal_date, name, base_xp)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, "GAIN", goalValue, goalDate.toISOString(), name, 500]
        );
    }

    console.log(`✅ Quest seeded for user ${userId}`);
}
