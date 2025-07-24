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
import WeightSystemSelector from "../components/WeightSystemSelector";
import Sparks from "../components/Sparks";
import { authFetch } from "../utils/authFetch";
import { logout } from "../utils/logout";
import * as SecureStore from "expo-secure-store";
import { registerForPushNotificationsAsync } from "../utils/notification";
import { playLevelUpSound } from "../utils/playLevelUpSound";
import { playCompleteSound } from "../utils/playCompleteSound";
import { playDeleteSound } from "../utils/playDeleteSound";
import { playAlertSound } from "../utils/playAlertSound";
import { SafeAreaView } from "react-native-safe-area-context";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import { getConvertedQuestFields } from "../utils/unitUtils";

interface AchievementDetails {
    id: number;
    name: string;
    xp: number;
    weeklyReset: boolean;
    isQuest: boolean;
}

interface Quest {
    name: string;
    type: "GAIN" | "LOSE";
    goal: number;
    goalDate: string | Date;
    baseXP: number;
    initialWeight: number;
}

interface UserQuest {
    quest: Quest;
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
    weightSystem: "IMPERIAL" | "METRIC";
    userQuest: UserQuest;
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
    const levelUpAnim = useRef(new Animated.Value(0)).current;
    const [showLevelUpImage, setShowLevelUpImage] = useState(false);
    const [showWeightSelector, setShowWeightSelector] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState<"IMPERIAL" | "METRIC">(
        userData?.weightSystem || "IMPERIAL"
    );
    const [pendingSystem, setPendingSystem] = useState<
        "IMPERIAL" | "METRIC" | null
    >(null);

    const triggerLevelUpImage = () => {
        setShowLevelUpImage(true);
        levelUpAnim.setValue(100);

        Animated.timing(levelUpAnim, {
            toValue: -35,
            duration: 700,
            useNativeDriver: true,
        }).start(() => {
            setShowLevelUpImage(false);
        });
    };

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
            triggerLevelUpImage();

            // Bump the displayed level
            setDisplayLevel((prev) => (prev ?? 0) + 1);

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

            // Get user weight system
            setSelectedSystem(data.weightSystem);
            await SecureStore.setItemAsync("weightSystem", data.weightSystem);
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
        if (pendingSystem) {
            await handleUpdateWeightSystem(pendingSystem);
            setPendingSystem(null);
            playCompleteSound();
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
                    source={require("../assets/DumbbellPixel.png")}
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

    const handleUpdateWeightSystem = async (
        newSystem: "IMPERIAL" | "METRIC"
    ) => {
        if (newSystem === selectedSystem) return;

        try {
            const userId = await SecureStore.getItemAsync("userId");

            // Delete all bodyweight and exercise entries
            handleDeleteAllBodyWeightEntries(Number(userId));
            handleDeleteAllExerciseWeightEntires(Number(userId));

            await authFetch(
                `/user/updateWeightSystem/${userId}?weightSystem=${newSystem}`,
                { method: "PATCH" }
            );

            let updatedUserData = { ...userData!, weightSystem: newSystem };
            const questFields = getConvertedQuestFields(
                userData!.userQuest.quest,
                newSystem
            );

            if (questFields) {
                await authFetch(`/quest/editQuest/${userId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...questFields,
                        isRealUpdate: false,
                    }),
                });

                updatedUserData = {
                    ...updatedUserData,
                    userQuest: {
                        ...updatedUserData.userQuest,
                        quest: {
                            ...updatedUserData.userQuest.quest,
                            ...questFields,
                        },
                    },
                };
            }

            setSelectedSystem(newSystem);
            setUserData(updatedUserData);
            await SecureStore.setItemAsync("weightSystem", newSystem);
            await fetchUserData();
        } catch (err) {
            playBadMoveSound();
            console.error("Error updating weight system and quest", err);
        }
    };

    const handleSystemPress = (system: "IMPERIAL" | "METRIC") => {
        if (system === selectedSystem) return;

        setPendingSystem(system);
        setmodalTitleMessage("Change Weight System?");
        setModalMessage(
            `Are you sure you want to switch to ${
                system === "IMPERIAL" ? "Imperial (lbs)" : "Metric (kg)"
            }? This will delete all of your bodyweight and exercise entries...`
        );
        setModalVisible(true);
    };

    const handleDeleteAllBodyWeightEntries = async (userId: number) => {
        try {
            await authFetch(`/user/deleteAllUserWeightEntries/${userId}`, {
                method: "DELETE",
            });
        } catch (err) {
            console.error(err);
            playBadMoveSound();
        }
    };

    if (loading || !userData) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0ff" />
            </View>
        );
    }

    const handleDeleteAllExerciseWeightEntires = async (userId: number) => {
        try {
            await authFetch(
                `/workouts/deleteAllEntriesForUser?userId=${userId}`,
                {
                    method: "DELETE",
                }
            );
        } catch (err) {
            console.error(err);
            playBadMoveSound();
        }
    };

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
                            source={require("../assets/DumbbellPixel.png")}
                            style={{
                                width: 50,
                                height: 50,
                                marginBottom: 20,
                            }}
                        />

                        <PixelText
                            fontSize={12}
                            color="#fff"
                            style={{ marginBottom: 10 }}
                        >
                            Level: {displayLevel ?? userData.level} | XP:{" "}
                            {userData.xp}
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

                            {showLevelUpImage && (
                                <Animated.Image
                                    source={require("../assets/LevelUpPixel.png")}
                                    style={{
                                        width: 240,
                                        height: 240,
                                        position: "absolute",
                                        alignSelf: "center",
                                        bottom: 0,
                                        transform: [
                                            { translateY: levelUpAnim },
                                        ],
                                        zIndex: 10,
                                    }}
                                    resizeMode="contain"
                                />
                            )}
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
                                    {selectedSystem === "METRIC"
                                        ? `${(
                                              userData.totalWeightLifted *
                                              0.453592
                                          ).toFixed(1)} kg`
                                        : `${userData.totalWeightLifted} lbs`}
                                    !
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
                            text="Update Units (lbs/kg)"
                            onPress={() =>
                                setShowWeightSelector(!showWeightSelector)
                            }
                            color="#FF6F61"
                            containerStyle={{
                                borderColor: "#FF6F61",
                                marginTop: 10,
                            }}
                        />

                        {showWeightSelector && (
                            <WeightSystemSelector
                                selectedSystem={selectedSystem}
                                onSelectSystem={handleSystemPress}
                            />
                        )}

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
