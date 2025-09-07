import * as SQLite from "expo-sqlite";

export async function progressAchievementLocal(
    achievementId: number,
    progressToAdd: number
) {
    const db = await SQLite.openDatabaseAsync("gymgamer.db");

    const achievement: any = await db.getFirstAsync(
        `SELECT * FROM achievements WHERE id = ?`,
        [achievementId]
    );

    if (!achievement) throw new Error("Achievement not found");

    const newProgress = Math.min(
        100,
        (achievement.progress || 0) + progressToAdd
    );
    const completed = newProgress >= 100 ? 1 : 0;
    const completedAt = completed
        ? new Date().toISOString()
        : achievement.completed_at;

    await db.runAsync(
        `UPDATE achievements
     SET progress = ?, completed = ?, completed_at = ?
     WHERE id = ?`,
        [newProgress, completed, completedAt, achievementId]
    );

    return {
        ...achievement,
        progress: newProgress,
        completed,
        completed_at: completedAt,
    };
}
