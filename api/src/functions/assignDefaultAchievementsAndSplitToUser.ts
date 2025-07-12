import { prisma } from "../config.js";

export async function assignDefaultAchievementsAndSplitToUser(userId: number) {
    // 1. Fetch all achievement IDs from Achievement table
    const achievements = await prisma.achievement.findMany({
        where: { isQuest: false },
        select: { id: true },
    });

    // 2. Prepare UserAchievement records (if you want, skip duplicates)
    // Optionally, fetch existing UserAchievements to avoid duplicates
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

    // 3. Upsert UserAchievements (bulk create new ones)
    if (newUserAchievements.length > 0) {
        await prisma.userAchievement.createMany({
            data: newUserAchievements,
            skipDuplicates: true,
        });
    }

    // 4. Assign default workout split PUSH, PULL, LEGS

    // Connect or create workout split for user
    const split = await prisma.workoutSplit.upsert({
        where: { userId },
        update: {},
        create: { userId },
        include: { days: true },
    });

    // Figure out existing days to avoid duplicates
    const existingDayNames = new Set(
        split.days.map((d) => d.dayName.toUpperCase())
    );

    // Days to add
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

    // Optionally return updated user with achievements & split
    const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            achievements: {
                include: { achievement: true },
            },
            workoutSplit: {
                include: { days: true },
            },
        },
    });

    return updatedUser;
}
