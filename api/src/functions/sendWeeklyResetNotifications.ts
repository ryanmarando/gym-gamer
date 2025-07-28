import { Expo } from "expo-server-sdk";
import { prisma } from "../config.js";

const expo = new Expo();

export async function sendWeeklyResetNotifications() {
    console.log("Trying to send notification from backend...");
    const users = await prisma.user.findMany({
        where: {
            expoPushToken: { not: null },
        },
    });

    const messages = [];

    for (let user of users) {
        if (!Expo.isExpoPushToken(user.expoPushToken!)) continue;

        messages.push({
            to: user.expoPushToken!,
            sound: "default",
            title: "It's The Weekly Reset!",
            body: "Your weekly achievements have been reset. A new week of new challenges!",
            data: { type: "weeklyReset" },
        });
    }

    const chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
        try {
            await expo.sendPushNotificationsAsync(chunk);
        } catch (err) {
            console.error(err);
        }
    }
}
