import { prisma } from "../config.js";

export async function weeklyReset() {
    console.log("🔄 Starting weekly achievement reset...");

    await prisma.$transaction(async (tx) => {
        // 1️⃣ Find all achievements that reset weekly
        const achievementsToReset = await tx.achievement.findMany({
            where: { weeklyReset: true },
            select: { id: true, name: true },
        });

        if (achievementsToReset.length === 0) {
            console.log("✅ No weekly-reset achievements found.");
        } else {
            const achievementIds = achievementsToReset.map((a) => a.id);

            console.log(
                `🎯 Found ${achievementIds.length} achievements to reset.`
            );

            // 2️⃣ Reset user achievements progress + completed
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
        }

        // 3️⃣ Also reset all users' weeklyWeightLifted
        const resetUsers = await tx.user.updateMany({
            data: { weeklyWeightLifted: 0 },
        });

        console.log(
            `🗑️ Reset weeklyWeightLifted for ${resetUsers.count} users.`
        );
    });
}
