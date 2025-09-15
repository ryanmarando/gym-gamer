import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";
import { sendPushNotification } from "./notification";

export const handleWeeklyReset = async (force: boolean = false) => {
    const now = new Date();
    const lastResetStr = await SecureStore.getItemAsync("lastWeeklyReset");
    const lastReset = lastResetStr ? new Date(lastResetStr) : null;

    console.log("Checking weekly reset...");

    const lastSunday = getLastSunday(23, 59);

    // If we are after last Sunday 11:59PM and haven't reset yet, do it
    if (force || (now > lastSunday && (!lastReset || lastReset < lastSunday))) {
        const db = await SQLite.openDatabaseAsync("gymgamer.db");

        await db.runAsync(
            `UPDATE achievements SET progress = 0 WHERE weekly_reset = TRUE`
        );

        await db.runAsync(
            `UPDATE users SET weekly_weight_lifted = 0 WHERE id = 1`
        );

        await SecureStore.setItemAsync("lastWeeklyReset", now.toISOString());
        const expoPushToken = await SecureStore.getItemAsync("notifToken");
        if (expoPushToken) {
            await sendPushNotification({
                expoPushToken,
                title: "Weekly Reset Complete!",
                body: "💪 Your weekly achievements have been reset. Time to grind again!",
            });
        }
        console.log("Weekly reset applied locally!");
    }
};

// Helper to get the most recent Sunday at 11:59 PM
const getLastSunday = (hour: number, minute: number) => {
    const now = new Date();
    const lastSunday = new Date(now);

    // go back to Sunday
    lastSunday.setDate(now.getDate() - ((now.getDay() + 7 - 0) % 7));
    lastSunday.setHours(hour, minute, 0, 0);

    return lastSunday;
};
