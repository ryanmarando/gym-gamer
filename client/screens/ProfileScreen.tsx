import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    StyleSheet,
    Image,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import PixelModal from "../components/PixelModal";
import PixelAchievementCard from "../components/PixelAchievementCard";
import ProgressBar from "../components/ProgressBar";
import { authFetch } from "../utils/authFetch";
import { logout } from "../utils/logout";
import { resetStats } from "../utils/resetStats";
import * as SecureStore from "expo-secure-store";
import { playPixelSound } from "../utils/playPixelSound";
import {
    sendPushNotification,
    registerForPushNotificationsAsync,
    scheduleNotification,
} from "../utils/notification";

interface UserData {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    level: number;
    levelProgress: number;
    xp: number;
}

export default function ProfileScreen({
    navigation,
    isLoggedIn,
    setIsLoggedIn,
}: any) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>(
        "You will be logged out."
    );
    const [modalTitleMessage, setmodalTitleMessage] =
        useState<string>("Are you sure?");
    const [modalAction, setModalAction] = useState<"logout" | "reset" | null>(
        null
    );
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

    useEffect(() => {
        const registerPush = async () => {
            const token = await registerForPushNotificationsAsync();
            if (token) setExpoPushToken(token);
        };
        registerPush();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (isLoggedIn) {
                fetchUserData();
            }
        }, [isLoggedIn])
    );

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userId = await SecureStore.getItemAsync("userId");
            const data = await authFetch(`/user/${Number(userId)}`);
            //console.log("✅ User data:", data);
            console.log("✅ Profile screen loaded");
            setUserData(data);
        } catch (error) {
            console.error("❌ Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const doResetStats = async () => {
        if (!userData) return;

        try {
            await resetStats(Number(userData.id));
            const data = await authFetch(`/user/${Number(userData.id)}`);
            setUserData(data);
        } catch (error) {
            console.error("❌ Error resetting stats:", error);
        }
    };

    const handleModalConfirm = async () => {
        if (modalAction === "logout") {
            logoutUser();
        } else if (modalAction === "reset") {
            await doResetStats();
        }
        setModalVisible(false);
    };

    const logoutUser = async () => {
        logout(setIsLoggedIn, setUserData);
        setModalVisible(false);
    };

    const resetUserStats = async () => {
        setModalVisible(true);
        const message = `This will reset your XP and return your level to 0.`;
        setModalAction("reset");
        setModalMessage(message);
    };

    if (!isLoggedIn) {
        return (
            <View style={styles.container}>
                <PixelText
                    fontSize={20}
                    color="#0ff"
                    style={{ marginBottom: 20 }}
                >
                    Welcome to Gym Gamer!
                </PixelText>

                <Image
                    source={require("../assets/barbell_pixel.png")}
                    style={{ width: 100, height: 100, marginBottom: 20 }}
                />

                <PixelButton
                    text="Go to Login"
                    onPress={() => navigation.navigate("Login")}
                    color="#ff0"
                    containerStyle={{
                        backgroundColor: "#000",
                        borderColor: "#ff0",
                    }}
                />
            </View>
        );
    }

    if (loading || !userData) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0ff" />
            </View>
        );
    }

    const sendNotification = async () => {
        if (!expoPushToken) {
            return;
        }
        const title = "Hey Gamer!";
        const body = "You completed an achievement!";
        await sendPushNotification({ expoPushToken, title, body });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <PixelText
                    fontSize={20}
                    color="#0ff"
                    style={{ marginBottom: 20 }}
                >
                    🎮 Welcome, {userData.name}!
                </PixelText>

                <Image
                    source={require("../assets/barbell_pixel.png")}
                    style={{ width: 100, height: 100, marginBottom: 20 }}
                />

                <PixelText
                    fontSize={12}
                    color="#fff"
                    style={{ marginBottom: 10 }}
                >
                    Level: {userData.level} | XP: {userData.xp}
                </PixelText>

                <ProgressBar
                    progress={userData.levelProgress / 100}
                    width={250}
                    height={15}
                    backgroundColor="#222"
                    progressColor="#ff0"
                    borderColor="#ff0"
                />

                <PixelButton
                    text="Reset Stats"
                    onPress={resetUserStats}
                    color="#f00"
                    containerStyle={{
                        backgroundColor: "#000",
                        borderColor: "#f00",
                        marginTop: 10,
                    }}
                />
                <View
                    style={{
                        alignItems: "center",
                        marginTop: 20,
                    }}
                >
                    <PixelText fontSize={12} color="#fff">
                        Get into the gym:
                    </PixelText>
                    <PixelButton
                        text="Start Workout"
                        onPress={() => {
                            navigation.navigate("Workouts");
                            playPixelSound();
                        }}
                        color="#f0f"
                        containerStyle={{
                            backgroundColor: "#000",
                            borderColor: "#f0f",
                            marginTop: 10,
                        }}
                    />
                </View>

                <PixelButton
                    containerStyle={{
                        backgroundColor: "#000",
                        borderColor: "#0ff",
                        marginTop: 20,
                    }}
                    text="Send Notification"
                    onPress={sendNotification}
                />
            </View>

            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Achievements")}
                    style={{
                        backgroundColor: "transparent",
                    }}
                >
                    <PixelAchievementCard />
                </TouchableOpacity>
                <PixelButton
                    text="Log Out"
                    onPress={() => {
                        setModalAction("logout");
                        setModalVisible(true);
                        const message = "You will be logged out.";
                        setModalMessage(message);
                    }}
                    color="#f00"
                    containerStyle={{
                        backgroundColor: "#000",
                        borderColor: "#f00",
                    }}
                />
                <PixelModal
                    visible={modalVisible}
                    title={modalTitleMessage}
                    message={modalMessage}
                    onConfirm={handleModalConfirm}
                    onCancel={() => setModalVisible(false)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: "5%",
        paddingVertical: "20%",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    bottomButtonContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
        marginBottom: "-17%",
    },
});
