import { prisma } from "../config.js";

export async function weeklyReset() {
    console.log("🔄 Starting weekly achievement reset...");

    await prisma.$transaction(async (tx) => {
        // 1. Get all achievements that should reset weekly
        const achievementsToReset = await tx.achievement.findMany({
            where: { weeklyReset: true },
            select: { id: true, name: true },
        });

        if (achievementsToReset.length === 0) {
            console.log("✅ No weekly-reset achievements found.");
            return;
        }

        const achievementIds = achievementsToReset.map((a) => a.id);

        console.log(`🎯 Found ${achievementIds.length} achievements to reset.`);

        // 2. Update all userAchievements for those
        const updated = await tx.userAchievement.updateMany({
            where: {
                achievementId: { in: achievementIds },
            },
            data: {
                progress: 0,
                completed: false,
            },
        });

        console.log(
            `✅ Weekly reset done! ${updated.count} user achievements reset.`
        );
    });
}
