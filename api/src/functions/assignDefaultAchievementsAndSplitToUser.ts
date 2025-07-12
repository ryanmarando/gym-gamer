import { prisma } from "../config.js";

export async function assignDefaultAchievementsAndSplitToUser(userId: number) {
    // 1. Fetch all achievement IDs from Achievement table
    const achievements = await prisma.achievement.findMany({
        where: { isQuest: false },
        select: { id: true },
    });

    // 2. Prepare UserAchievement records (skip duplicates)
    const existingUserAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
    });
    const existingIds = new Set(
        existingUserAchievements.map((a) => a.achievementId)
    );

    const newUserAchievements = achievements
        .filter((a) => !existingIds.has(a.id))
        .map((a) => ({
            userId,
            achievementId: a.id,
            progress: 0,
            completed: false,
        }));

    if (newUserAchievements.length > 0) {
        await prisma.userAchievement.createMany({
            data: newUserAchievements,
            skipDuplicates: true,
        });
    }

    // 3. Assign default workout split PUSH, PULL, LEGS
    const split = await prisma.workoutSplit.upsert({
        where: { userId },
        update: {},
        create: { userId },
        include: { days: true },
    });

    const existingDayNames = new Set(
        split.days.map((d) => d.dayName.toUpperCase())
    );
    const defaultDays = ["PUSH", "PULL", "LEGS"];
    const daysToAdd = defaultDays.filter((day) => !existingDayNames.has(day));

    if (daysToAdd.length > 0) {
        await prisma.workoutDay.createMany({
            data: daysToAdd.map((dayName, idx) => ({
                dayIndex: split.days.length + idx + 1,
                dayName,
                splitId: split.id,
            })),
        });
    }

    // ✅ 4. Create a default quest for the user
    const goalDate = new Date();
    goalDate.setDate(goalDate.getDate() + 30);

    await prisma.quest.upsert({
        where: { userId: userId },
        update: {
            type: "GAIN",
            goal: 10,
            goalDate: goalDate,
            name: `Gain 10 lbs by ${goalDate.toLocaleDateString()}`,
        },
        create: {
            type: "GAIN",
            goal: 10,
            goalDate: goalDate,
            name: `Gain 10 lbs by ${goalDate.toLocaleDateString()}`,
            userId: userId,
        },
    });

    // ✅ Optionally return updated user with achievements & split & quests
    const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            achievements: {
                include: { achievement: true },
            },
            workoutSplit: {
                include: { days: true },
            },
            quest: true,
        },
    });

    console.log("Gave new user achievements, splits, and a goal.");
    return updatedUser;
}
//
