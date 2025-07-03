import { prisma } from "./config.js";

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
        { name: "First Workout!", xp: 50 },
        { name: "One Week Streak", xp: 100 },
        { name: "5 Workouts in a Week", xp: 150 },
        { name: "10 Workouts in a Month", xp: 250 },
        { name: "Consistency King/Queen", xp: 500 },
        { name: "Early Bird - 5 Morning Workouts", xp: 100 },
        { name: "Leg Day Lover - 5 Leg Workouts", xp: 120 },
        { name: "Personal Best: Bench Press", xp: 200 },
        { name: "Personal Best: Deadlift", xp: 200 },
        { name: "New Year, New Me - January Challenge", xp: 300 },
        { name: "Bring a Friend", xp: 75 },
        { name: "Fitness Journey: 100 Workouts Completed", xp: 1000 },
    ];

    for (const ach of achievements) {
        await prisma.achievement.create({
            data: ach,
        });
    }

    console.log("Seeded achievements!");
}

SeedAchievements();
