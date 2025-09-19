import { getDb } from "../db/db";
import { checkAndProgressAchievements } from "./checkAndProgressAchievements";

function getRequiredXp(level: number): number {
    const baseXP = 100;
    const factor = 1.2;
    return Math.floor(baseXP * level * factor);
}

export async function addXpAndCheckLevelUp(xpToAdd: number) {
    const db = await getDb();

    const user: any = await db.getFirstAsync(
        "SELECT id, xp, level, name FROM users"
    );

    if (!user) throw new Error("User not found");

    console.log(`Awarding ${xpToAdd} XP`);

    let newXp = user.xp + xpToAdd;
    let newLevel = user.level;
    const allNewlyCompleted: any[] = [];

    while (true) {
        const requiredXp = getRequiredXp(newLevel);
        if (newXp >= requiredXp) {
            newXp -= requiredXp;
            newLevel += 1;

            const newLevelAchievements = await checkAndProgressAchievements(
                "LEVEL",
                { level: newLevel }
            );

            if (newLevelAchievements.length > 0) {
                console.log(`🏆 ${user.name} unlocked:`, newLevelAchievements);
                allNewlyCompleted.push(...newLevelAchievements);
            }
        } else {
            break;
        }
    }

    const requiredXpForLevel = getRequiredXp(newLevel);
    const progressPercent =
        requiredXpForLevel === 0
            ? 0
            : Math.floor((newXp / requiredXpForLevel) * 100);

    await db.runAsync(
        `UPDATE users 
     SET xp = ?, level = ?, level_progress = ?`,
        [newXp, newLevel, progressPercent]
    );

    const updatedUser = await db.getFirstAsync(
        `SELECT id, name, xp, level, level_progress 
        FROM users`
    );

    return { updatedUser, newlyCompletedAchievements: allNewlyCompleted };
}
