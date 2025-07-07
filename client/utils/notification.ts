// utils/notifications.ts

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    if (!Device.isDevice) {
        alert("Must use physical device for Push Notifications");
        return null;
    }

    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        alert("Failed to get push token for push notifications!");
        return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
}

export async function scheduleNotification({
    title,
    body,
    data = {} as Record<string, unknown>, // fix 1: specify data as Record<string, unknown>
    seconds = 2,
    repeats = false,
}: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    seconds?: number;
    repeats?: boolean;
}) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2,
        },
    });
}
