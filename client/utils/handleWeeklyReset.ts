import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";

export const handleWeeklyReset = async () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const lastResetStr = await SecureStore.getItemAsync("lastWeeklyReset");
    const lastReset = lastResetStr ? new Date(lastResetStr) : null;

    console.log("Checking weekly reset...");

    // Sunday at or after 11:59 PM
    const resetHour = 23;
    const resetMinute = 59;
    const resetDue =
        dayOfWeek === 0 &&
        (now.getHours() > resetHour ||
            (now.getHours() === resetHour && now.getMinutes() >= resetMinute));

    if (
        resetDue &&
        (!lastReset || lastReset < getLastSunday(resetHour, resetMinute))
    ) {
        const db = await SQLite.openDatabaseAsync("gymgamer.db");

        // Reset weekly achievements
        await db.runAsync(
            `UPDATE achievements SET progress = 0 WHERE weekly_reset = TRUE`
        );

        // Reset weekly lifted weight
        await db.runAsync(
            `UPDATE users SET weekly_weight_lifted = 0 WHERE id = 1`
        );

        await SecureStore.setItemAsync("lastWeeklyReset", now.toISOString());
        console.log("Weekly reset applied locally!");
    }
};

// Helper to get the last Sunday at 11:59 PM
const getLastSunday = (hour: number, minute: number) => {
    const now = new Date();
    const diff = (now.getDay() + 7) % 7;
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - diff);
    lastSunday.setHours(hour, minute, 0, 0);
    return lastSunday;
};
