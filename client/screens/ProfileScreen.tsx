import React, { useEffect, useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    StyleSheet,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    ScrollView,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import PixelModal from "../components/PixelModal";
import PixelQuestCard from "../components/PixelQuestCard";
import ProgressBar from "../components/ProgressBar";
import Sparks from "../components/Sparks";
import { authFetch } from "../utils/authFetch";
import { logout } from "../utils/logout";
import * as SecureStore from "expo-secure-store";
import { registerForPushNotificationsAsync } from "../utils/notification";
import { playLevelUpSound } from "../utils/playLevelUpSound";
import { playDeleteSound } from "../utils/playDeleteSound";
import { playAlertSound } from "../utils/playAlertSound";
import { SafeAreaView } from "react-native-safe-area-context";

interface AchievementDetails {
    id: number;
    name: string;
    xp: number;
    weeklyReset: boolean;
    isQuest: boolean;
}

interface Quest {
    name: string;
    type: string;
    goal: number;
    goalDate: Date | string;
    baseXP: number;
}

interface UserData {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    level: number;
    levelProgress: number;
    xp: number;
    achievements: AchievementDetails[];
    activeQuest: Quest;
    totalWeightLifted: number;
    weeklyWeightLifted: number;
}

export default function ProfileScreen({
    navigation,
    isLoggedIn,
    setIsLoggedIn,
}: any) {
    const scrollRef = useRef<ScrollView>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>(
        "You will be logged out."
    );
    const [modalTitleMessage, setmodalTitleMessage] =
        useState<string>("Are you sure?");
    const [modalAction, setModalAction] = useState<"logout" | null>(null);
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [sparksActive, setSparksActive] = useState(false);
    const [questExpiredModalVisible, setQuestExpiredModalVisible] =
        useState(false);

    const animatedProgress = useRef(new Animated.Value(0)).current;
    const prevLevelRef = useRef(userData?.level);
    const prevXpRef = useRef(userData?.xp);
    const [displayLevel, setDisplayLevel] = useState<number | null>(null);
    const [displayXp, setDisplayXp] = useState<number | null>(null);

    const animateLevelUp = (remainingLevels: number) => {
        if (remainingLevels <= 0) {
            // Final bar for current level's progress
            Animated.timing(animatedProgress, {
                toValue: userData!.levelProgress / 100,
                duration: 1000,
                useNativeDriver: false,
            }).start(() => {
                setSparksActive(false);
                setDisplayLevel(userData!.level);
                setDisplayXp(userData!.xp);
            });
            return;
        }

        setSparksActive(true);

        Animated.timing(animatedProgress, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
        }).start(() => {
            playLevelUpSound();

            // Bump the displayed level
            setDisplayLevel((prev) => (prev ?? 0) + 1);
            setDisplayXp((prev) => (prev ?? 0) + 100);

            // Reset progress bar
            animatedProgress.setValue(0);

            animateLevelUp(remainingLevels - 1);
        });
    };

    useEffect(() => {
        if (!userData) return;

        const prevLevel = prevLevelRef.current ?? userData.level;
        const levelsGained = userData.level - prevLevel;

        // Start with previous values
        setDisplayLevel(prevLevel);
        setDisplayXp(prevXpRef.current ?? userData.xp);

        if (levelsGained > 0) {
            animateLevelUp(levelsGained);
        } else {
            setSparksActive(true);
            Animated.timing(animatedProgress, {
                toValue: userData.levelProgress / 100,
                duration: 1000,
                useNativeDriver: false,
            }).start(() => {
                setSparksActive(false);
            });
        }

        prevLevelRef.current = userData.level;
        prevXpRef.current = userData.xp;
    }, [userData?.xp, userData?.level]);

    useEffect(() => {
        const registerPush = async () => {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                setExpoPushToken(token);
                await SecureStore.setItemAsync("notifToken", token);
            }
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

            // Get their user achievements
            const userQuest = await authFetch(
                `/user/getUserQuest/${Number(userId)}`
            );

            // Merge into a single object
            const userDataWithQuest = {
                ...data,
                userQuest,
            };

            console.log("✅ Profile screen loaded");
            setUserData(userDataWithQuest);

            // Check if quest is expired
            if (
                userQuest.quest.goalDate &&
                new Date(userQuest.quest.goalDate) < new Date()
            ) {
                playAlertSound();
                setQuestExpiredModalVisible(true);
            }
        } catch (error) {
            console.error("❌ Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalConfirm = async () => {
        if (modalAction === "logout") {
            logoutUser();
        }
        setModalVisible(false);
    };

    const logoutUser = async () => {
        playDeleteSound();
        logout(setIsLoggedIn, setUserData);
        setModalVisible(false);
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
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
                            style={{ width: 100, height: 100 }}
                        />

                        <PixelText
                            fontSize={12}
                            color="#fff"
                            style={{ marginBottom: 10 }}
                        >
                            Level: {displayLevel ?? userData.level} | XP:{" "}
                            {displayXp ?? userData.xp}
                        </PixelText>

                        <View style={{ position: "relative" }}>
                            <ProgressBar
                                progress={animatedProgress}
                                width={250}
                                height={15}
                                backgroundColor="#222"
                                progressColor="#ff0"
                                borderColor="#ff0"
                            />
                            <Sparks active={sparksActive} />
                        </View>

                        <View
                            style={{
                                alignItems: "center",
                                marginTop: 20,
                            }}
                        >
                            {userData.totalWeightLifted > 0 && (
                                <PixelText
                                    fontSize={12}
                                    color="#fff"
                                    style={{ marginBottom: 10 }}
                                >
                                    You've lifted a total of{" "}
                                    {userData.totalWeightLifted} lbs!
                                </PixelText>
                            )}
                            <PixelText fontSize={12} color="#fff">
                                Get into the gym:
                            </PixelText>
                            <PixelButton
                                text="Start Workout"
                                onPress={() => {
                                    navigation.navigate("Workouts");
                                }}
                                color="#f0f"
                                containerStyle={{
                                    backgroundColor: "#000",
                                    borderColor: "#f0f",
                                    marginTop: 10,
                                    marginBottom: 20,
                                }}
                            />
                        </View>
                        <PixelText>Your quest:</PixelText>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Achievements")}
                            style={{
                                backgroundColor: "transparent",
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            <PixelQuestCard
                                quest={
                                    userData.activeQuest
                                        ? {
                                              name: userData.activeQuest.name,
                                              type: userData.activeQuest.type,
                                              goal: userData.activeQuest.goal,
                                              goalDate:
                                                  userData.activeQuest.goalDate,
                                              baseXP: userData.activeQuest
                                                  .baseXP,
                                          }
                                        : undefined
                                }
                                containerStyle={{ width: "90%" }}
                            />
                        </TouchableOpacity>

                        <PixelButton
                            text="Update bodyweight"
                            onPress={() => navigation.navigate("UpdateWeight")}
                        ></PixelButton>

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
                                marginTop: 10,
                            }}
                        />
                        <PixelModal
                            visible={modalVisible}
                            title={modalTitleMessage}
                            message={modalMessage}
                            onConfirm={handleModalConfirm}
                            onCancel={() => setModalVisible(false)}
                        />
                        <PixelModal
                            visible={questExpiredModalVisible}
                            title="Quest Expired!"
                            message="Hey gamer, your quest is currently past due! Please update it!"
                            onConfirm={() => {
                                setQuestExpiredModalVisible(false);
                                navigation.navigate("Achievements");
                            }}
                            onCancel={() => setQuestExpiredModalVisible(false)}
                        />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111",
    },
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: "5%",
        width: "100%",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
    },
    bottomButtonContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
});
