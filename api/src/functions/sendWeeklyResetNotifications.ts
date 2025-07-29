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
    const uniqueTokens = new Set<string>();
    const tokensSeen = new Map();

    for (let user of users) {
        const token = user.expoPushToken!;
        if (!Expo.isExpoPushToken(token)) continue;

        // Warn if multiple users share same token
        if (tokensSeen.has(token)) {
            console.warn(
                `⚠️ Duplicate token found: User ${
                    user.id
                } shares token with User ${tokensSeen.get(token)}`
            );
        } else {
            tokensSeen.set(token, user.id);
        }

        // Skip already used tokens
        if (uniqueTokens.has(token)) continue;
        uniqueTokens.add(token);

        messages.push({
            to: token,
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
