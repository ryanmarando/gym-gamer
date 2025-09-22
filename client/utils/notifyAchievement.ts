import * as SecureStore from "expo-secure-store";
import { sendPushNotification } from "../utils/notification";

/**
 * Sends a push notification when achievements are completed.
 *
 * @param achievements - Array of completed achievements (must have `name` field)
 */
export const notifyAchievements = async (achievements: { name: string }[]) => {
    try {
        const expoPushToken = await SecureStore.getItemAsync("notifToken");
        console.log("Push token:", expoPushToken);

        if (!expoPushToken) return;

        const title = "Hey, Gym Gamer!";
        let body: string;

        if (achievements.length === 1) {
            body = `🏆 You completed '${achievements[0].name}'!`;
        } else {
            body = `🏆 You completed ${achievements.length} achievements!`;
        }

        await sendPushNotification({ expoPushToken, title, body });
        console.log(`🏆 You completed '${achievements[0].name}'!`);
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
};
