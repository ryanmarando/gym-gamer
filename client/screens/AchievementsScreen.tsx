import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import PixelText from "../components/PixelText";
import ProgressBar from "../components/ProgressBar";
import PixelModal from "../components/PixelModal";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import { playPixelSound } from "../utils/playPixelSound";

interface AchievementDetails {
    id: number;
    name: string;
    xp: number;
    weeklyReset: boolean;
}

interface UserAchievement {
    userId: number;
    achievementId: number;
    progress: number;
    completed: boolean;
    isQuest: boolean;
    achievement: AchievementDetails;
}

interface PixelAchievementCardProps {
    achievement?: {
        id: number;
        name: string;
        description: string;
        imageUrl?: string;
        // any other fields you want
    };
}

export default function AchievementsScreen({
    achievement,
}: PixelAchievementCardProps) {
    const [achievements, setAchievements] = useState<AchievementDetails[]>([]); // All achievements
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
        []
    ); // User's achievements
    const [quests, setQuests] = useState<AchievementDetails[]>([]); // Quests
    const [userId, setUserId] = useState<number | null>(null);
    const [refreshToggle, setRefreshToggle] = useState(false); // to trigger refresh
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        onConfirm: () => {},
    });

    useEffect(() => {
        const fetchUserId = async () => {
            const idStr = await SecureStore.getItemAsync("userId");
            if (idStr) setUserId(Number(idStr));
        };
        fetchUserId();
    }, []);

    // Fetch both achievements and user achievements whenever userId or refreshToggle changes
    useFocusEffect(
        useCallback(() => {
            console.log("✅ Achivements loaded");
            if (userId === null) return;

            const fetchAchievements = async () => {
                const data = await authFetch("/achievement");
                setAchievements(data || []);
            };

            const fetchUserAchievements = async () => {
                const data = await authFetch(
                    `/user/getUserAchievements/${userId}`
                );
                setUserAchievements(data?.achievements || []);
            };

            const fetchQuest = async () => {
                const data = await authFetch("/achievement/quests");
                setQuests(data || []);
            };

            fetchAchievements();
            fetchUserAchievements();
            fetchQuest();

            // Optionally return a cleanup function if needed
            return () => {
                // cleanup if necessary
            };
        }, [userId, refreshToggle])
    );

    const handleAddPress = (questId: number) => {
        const alreadyHasQuest = userAchievements.some((ua) => ua.isQuest);

        if (alreadyHasQuest) {
            // Show confirmation to replace
            setModalConfig({
                title: "Change Quest",
                message: "Are you sure you want to change your quest?",
                onConfirm: async () => {
                    // Remove old quest
                    await removeExistingQuest();
                    // Add new quest
                    await handleAdd(questId);
                    setModalVisible(false);
                },
            });
            setModalVisible(true);
        } else {
            handleAdd(questId);
        }
    };

    const removeExistingQuest = async () => {
        const questToRemove = userAchievements.find((ua) => ua.isQuest);
        if (questToRemove) {
            await handleDelete(questToRemove.achievementId);
        }
    };

    const handleDeletePress = (questId: number) => {
        setModalConfig({
            title: "Remove Quest",
            message: "Are you sure you want to remove your quest?",
            onConfirm: async () => {
                await handleDelete(questId);
                setModalVisible(false);
            },
        });
        setModalVisible(true);
    };

    // Add achievement to user
    const handleAdd = async (achievementId: number) => {
        if (!userId) return;
        try {
            await authFetch(
                `/achievement/saveToUser?userId=${userId}&achievementId=${achievementId}`,
                {
                    method: "PATCH",
                }
            );
            setRefreshToggle((prev) => !prev); // triggers re-fetch and UI update
            playPixelSound();
        } catch (error) {
            Alert.alert("Error", "Failed to add achievement.");
            console.error(error);
        }
    };

    // Delete achievement from user
    const handleDelete = async (achievementId: number) => {
        if (!userId) return;
        try {
            await authFetch(
                `/achievement?userId=${userId}&achievementId=${achievementId}`,
                {
                    method: "DELETE",
                }
            );
            setRefreshToggle((prev) => !prev); // triggers re-fetch and UI update
        } catch (error) {
            Alert.alert("Error", "Failed to delete achievement.");
            console.error(error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Quests Section */}
            <PixelText fontSize={18} color="#ff0" style={{ marginBottom: 10 }}>
                🏆 Conquer With Quests
            </PixelText>

            {quests.length === 0 ? (
                <PixelText
                    fontSize={14}
                    color="#888"
                    style={{ marginBottom: 20 }}
                >
                    No quests found.
                </PixelText>
            ) : (
                <View style={styles.grid}>
                    {quests.map((item) => {
                        const isAdded = userAchievements.some(
                            (ua) => ua.achievementId === item.id
                        );

                        return (
                            <View key={item.id} style={styles.card}>
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: "center",
                                        width: "110%",
                                    }}
                                >
                                    <PixelText
                                        fontSize={12}
                                        color="#fff"
                                        style={{
                                            marginBottom: 4,
                                            width: "100%",
                                        }}
                                    >
                                        {item.name}
                                    </PixelText>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginBottom: 4,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            {
                                                backgroundColor: isAdded
                                                    ? "#f00"
                                                    : "#0f0",
                                            },
                                        ]}
                                        onPress={() =>
                                            isAdded
                                                ? handleDeletePress(item.id)
                                                : handleAddPress(item.id)
                                        }
                                    >
                                        <PixelText fontSize={10} color="#000">
                                            {isAdded ? "Delete" : "Add"}
                                        </PixelText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                    <PixelModal
                        visible={modalVisible}
                        title={modalConfig.title}
                        message={modalConfig.message}
                        onConfirm={modalConfig.onConfirm}
                        onCancel={() => setModalVisible(false)}
                    />
                </View>
            )}

            {/* User's Achievements Section */}
            <View style={styles.separator} />
            <PixelText fontSize={20} color="#0ff" style={{ marginBottom: 20 }}>
                💪 Your Achievements
            </PixelText>

            {userAchievements.length === 0 ? (
                <PixelText
                    fontSize={14}
                    color="#888"
                    style={{ marginBottom: 20 }}
                >
                    You haven't earned any achievements yet.
                </PixelText>
            ) : (
                <View style={styles.grid}>
                    {userAchievements.map((item) => (
                        <View key={item.achievementId} style={styles.card}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "space-between",
                                    width: "110%",
                                }}
                            >
                                <PixelText
                                    fontSize={12}
                                    color="#0ff"
                                    style={{ marginBottom: 4, width: "100%" }}
                                >
                                    {item.achievement.name}{" "}
                                    {/* <-- nested here */}
                                </PixelText>

                                <ProgressBar
                                    progress={item.progress / 100}
                                    width={160}
                                    height={15}
                                    backgroundColor="#333"
                                    progressColor="#0ff"
                                    borderColor="#0ff"
                                />

                                {/* Delete button */}
                                {item.completed ? (
                                    <PixelText fontSize={10} color="#0f0">
                                        Completed ✅
                                    </PixelText>
                                ) : (
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: "#f00",
                                            paddingVertical: 6,
                                            paddingHorizontal: 10,
                                            borderRadius: 4,
                                            marginBottom: 6,
                                        }}
                                        onPress={() =>
                                            handleDelete(item.achievementId)
                                        }
                                    >
                                        <PixelText fontSize={10} color="#fff">
                                            Delete
                                        </PixelText>
                                    </TouchableOpacity>
                                )}

                                {item.achievement.weeklyReset && (
                                    <PixelText fontSize={10} color="#0ff">
                                        Resets weekly 🔄
                                    </PixelText>
                                )}

                                <PixelText fontSize={10} color="#fff">
                                    {item.achievement.xp} XP{" "}
                                    {/* <-- nested here */}
                                </PixelText>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.separator} />

            {/* Available Achievements Section */}
            <PixelText fontSize={18} color="#ff0" style={{ marginBottom: 10 }}>
                🏆 Available Achievements
            </PixelText>

            <View style={styles.grid}>
                {achievements.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "space-between",
                                width: "110%",
                            }}
                        >
                            <PixelText
                                fontSize={12}
                                color="#0ff"
                                style={{ marginBottom: 4, width: "100%" }}
                            >
                                {item.name}
                            </PixelText>

                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: 4,
                                }}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { backgroundColor: "#0f0" },
                                    ]}
                                    onPress={() => handleAdd(item.id)}
                                >
                                    <PixelText fontSize={10} color="#000">
                                        Add
                                    </PixelText>
                                </TouchableOpacity>
                            </View>

                            <PixelText fontSize={10} color="#fff">
                                {item.xp} XP
                            </PixelText>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#111",
        alignItems: "center",
        paddingVertical: "20%",
        paddingHorizontal: 20,
    },
    separator: {
        width: "80%",
        height: 2,
        backgroundColor: "#0ff",
        marginVertical: 20,
    },
    grid: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        width: "48%",
        backgroundColor: "#222",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
        alignItems: "center",
        height: 140,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 6,
        borderRadius: 4,
        alignItems: "center",
    },
});
