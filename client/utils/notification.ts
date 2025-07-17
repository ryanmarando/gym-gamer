import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function sendPushNotification({
    expoPushToken,
    sound = "default",
    title = "Original Title",
    body = "And here is the body!",
    data = { someData: "goes here" },
}: {
    expoPushToken: string;
    sound?: string;
    title?: string;
    body?: string;
    data?: any;
}) {
    const message = {
        to: expoPushToken,
        sound,
        title,
        body,
        data,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    });
}

export async function scheduleNotification({
    title = "Original Title",
    body = "And here is the body!",
    data = { someData: "goes here" },
    seconds = 2,
    repeats = false,
    sound = "default",
}: {
    title?: string;
    body?: string;
    data?: any;
    seconds?: number;
    repeats?: boolean;
    sound?: string;
}) {
    console.log(`📅 Scheduling local notification in ${seconds}s`);

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2,
        },
    });
}

export async function registerForPushNotificationsAsync() {
    console.log("registerForPushNotificationsAsync called");

    if (Platform.OS === "android") {
        console.log("Setting Android notification channel...");
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    if (Device.isDevice) {
        console.log("Running on a real device ✅");

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        console.log("Existing permission status:", existingStatus);

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            console.log("Requested permission status:", status);
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.warn(
                "🚫 Permission not granted to get push token for push notification!"
            );
            return null; // don’t throw — just return null so you see it in your logs
        }

        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;

        console.log("Project ID:", projectId);

        if (!projectId) {
            console.error(
                "❌ Project ID not found — make sure it's set in app.json or app.config.js"
            );
            return null;
        }

        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({ projectId })
            ).data;

            console.log("✅ Got Expo push token:", pushTokenString);
            return pushTokenString;
        } catch (e) {
            console.error("❌ Error getting Expo push token:", e);
            return null;
        }
    } else {
        console.warn("🚫 Must use physical device for push notifications");
        return null;
    }
}
