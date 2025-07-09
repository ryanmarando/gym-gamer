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
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import UpdateQuestModal from "../components/UpdateQuestModal";
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
    const [modalConfirmationVisible, setModalConfirmationVisible] =
        useState(false);
    const [modalConfirmationConfig, setModalConfirmationConfig] = useState({
        title: "",
        message: "",
        onConfirm: () => {},
    });
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);

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
            const response = await authFetch(
                `/achievement/saveToUser?userId=${userId}&achievementId=${achievementId}`,
                {
                    method: "PATCH",
                }
            );
            console.log("Response", response);

            if (!response?.ok && response?.status === 400) {
                // Backend sent a 400 — get the message
                const data = await response.json();
                if (
                    data.message &&
                    data.message.includes("quest achievement")
                ) {
                    // Show your modal for quest limit
                    setModalConfirmationConfig({
                        title: "Quest Limit",
                        message:
                            "You can only have one quest at a time. Complete or remove your current quest first!",
                        onConfirm: () => setModalConfirmationVisible(false),
                    });
                    setModalConfirmationVisible(true);
                    return;
                }
            }

            setRefreshToggle((prev) => !prev); // triggers re-fetch and UI update
            playPixelSound();
        } catch (error: any) {
            if (error.message.includes("quest")) {
                setModalConfirmationConfig({
                    title: "Quest Limit",
                    message:
                        "You can only have one quest at a time. Complete or remove your current quest first!",
                    onConfirm: () => setModalConfirmationVisible(false),
                });
                setModalConfirmationVisible(true);
                return;
            }

            setModalConfirmationConfig({
                title: "Error",
                message: "Something went wrong. Please try again.",
                onConfirm: () => setModalConfirmationVisible(false),
            });
            setModalConfirmationVisible(true);
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

    const handleQuestUpdateConfirm = async (data: {
        customGoalAmount: number;
        customDeadline: string;
    }) => {
        try {
            const userId = await SecureStore.getItemAsync("userId");
            await authFetch(
                `/achievement/editQuest?userId=${userId}&achievementId=${selectedQuestId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );
            console.log("Quest updated!");
            setUpdateModalVisible(false);
        } catch (error) {
            console.error("Failed to update quest:", error);
        }
    };

    const handleUpdatePress = (questId: number) => {
        setSelectedQuestId(questId);
        setUpdateModalVisible(true);
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
                                {/* NAME */}
                                <View
                                    style={{
                                        width: "100%",
                                        marginBottom: 8,
                                    }}
                                >
                                    <PixelText
                                        fontSize={12}
                                        color="#fff"
                                        style={{
                                            textAlign: "center",
                                        }}
                                    >
                                        {item.name}
                                    </PixelText>
                                </View>

                                {/* BUTTONS */}
                                <View style={{ width: "100%" }}>
                                    {/* Add/Delete button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            {
                                                backgroundColor: isAdded
                                                    ? "#f00"
                                                    : "#0f0",
                                                marginBottom: 6,
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

                                    {/* Update button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            {
                                                backgroundColor: "#00f",
                                            },
                                        ]}
                                        onPress={() =>
                                            handleUpdatePress(item.id)
                                        }
                                    >
                                        <PixelText fontSize={10} color="#fff">
                                            Update
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
                    <ConfirmationPixelModal
                        visible={modalConfirmationVisible}
                        title={modalConfirmationConfig.title}
                        message={modalConfirmationConfig.message}
                        onConfirm={modalConfirmationConfig.onConfirm}
                        onCancel={() => setModalConfirmationVisible(false)}
                    />
                    <UpdateQuestModal
                        visible={updateModalVisible}
                        onConfirm={handleQuestUpdateConfirm}
                        onCancel={() => setUpdateModalVisible(false)}
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
                                            handleDeletePress(
                                                item.achievementId
                                            )
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
    },
    button: {
        flex: 1,
        width: "100%",
        marginHorizontal: 4,
        paddingVertical: 6,
        borderRadius: 4,
        alignItems: "center",
    },
});
