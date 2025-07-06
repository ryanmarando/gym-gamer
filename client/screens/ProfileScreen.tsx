import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import ProgressBar from "../components/ProgressBar";
import { authFetch } from "../utils/authFetch";
import { logout } from "../utils/logout";
import { completeWorkout } from "../utils/completeWorkout";
import { resetStats } from "../utils/resetStats";
import * as SecureStore from "expo-secure-store";

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

    useEffect(() => {
        if (isLoggedIn) {
            fetchUserData();
        }
    }, [isLoggedIn]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userId = await SecureStore.getItemAsync("userId");
            const data = await authFetch(`/user/${Number(userId)}`);
            console.log("✅ User data:", data);
            setUserData(data);
        } catch (error) {
            console.error("❌ Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = async () => {
        logout(setIsLoggedIn, setUserData);
    };

    const completeUserWorkout = async () => {
        try {
            await completeWorkout(Number(userData!.id));

            // ⏬ Re-fetch the user data to get new progress/level
            const data = await authFetch(`/user/${Number(userData!.id)}`);
            setUserData(data);
        } catch (error) {
            console.error("❌ Error completing workout:", error);
        }
    };

    const resetUserStats = async () => {
        try {
            await resetStats(Number(userData!.id));

            // ⏬ Re-fetch the user data to get new progress/level
            const data = await authFetch(`/user/${Number(userData!.id)}`);
            setUserData(data);
        } catch (error) {
            console.error("❌ Error resettting stats:", error);
        }
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
                    text="Complete Workout"
                    onPress={completeUserWorkout}
                    color="#f0f"
                    containerStyle={{
                        backgroundColor: "#000",
                        borderColor: "#f0f",
                        marginTop: 20,
                    }}
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
            </View>

            <View style={styles.bottomButtonContainer}>
                <PixelButton
                    text="Log Out"
                    onPress={logoutUser}
                    color="#f00"
                    containerStyle={{
                        backgroundColor: "#000",
                        borderColor: "#f00",
                    }}
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
    },
});
