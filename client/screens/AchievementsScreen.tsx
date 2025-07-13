import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    SectionList,
    Text,
} from "react-native";
import PixelText from "../components/PixelText";
import ProgressBar from "../components/ProgressBar";
import PixelButton from "../components/PixelButton";
import PixelModal from "../components/PixelModal";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import PixelQuestCard from "../components/PixelQuestCard";
import UpdateQuestModal from "../components/UpdateQuestModal";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";

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

interface Quest {
    id: number;
    name: string;
    type: string;
    goal: number;
    goalDate: string | Date;
}

export default function AchievementsScreen({}: PixelAchievementCardProps) {
    const [achievements, setAchievements] = useState<AchievementDetails[]>([]); // All achievements
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
        []
    ); // User's achievements
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
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

    // Prepare sections for SectionList
    const achievementSections = [
        {
            title: "Completed Achievements",
            data: userAchievements.filter((ua) => ua.completed),
        },
        {
            title: "In Progress Achievements",
            data: userAchievements.filter((ua) => !ua.completed),
        },
    ];

    useEffect(() => {
        const fetchUserId = async () => {
            const idStr = await SecureStore.getItemAsync("userId");
            if (idStr) setUserId(Number(idStr));
        };
        fetchUserId();
    }, []);

    const fetchActiveQuest = async () => {
        if (!userId) return;
        const quest = await authFetch(`/user/getUserQuest/${userId}`);
        setActiveQuest(quest.quest || null);
    };

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

            fetchAchievements();
            fetchUserAchievements();
            fetchActiveQuest();

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
            await authFetch(`/quest/editQuest/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            console.log("Quest updated!");
            setUpdateModalVisible(false);
            fetchActiveQuest();
        } catch (error) {
            console.error("Failed to update quest:", error);
        }
    };

    const handleUpdatePress = (questId: number) => {
        setSelectedQuestId(questId);
        setUpdateModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Quests Section */}
                <PixelText
                    fontSize={18}
                    color="#ff0"
                    style={{ marginBottom: 10 }}
                >
                    🏆 Conquer With Quests
                </PixelText>

                {activeQuest ? (
                    <>
                        <View
                            style={{
                                alignItems: "center",
                                width: "100%",
                                marginBottom: 10,
                            }}
                        >
                            <PixelQuestCard
                                quest={activeQuest}
                                containerStyle={{ width: "90%", maxWidth: 400 }}
                            />
                            <PixelButton
                                fontSize={15}
                                color="#fff"
                                text="Update Quest"
                                onPress={() =>
                                    handleUpdatePress(activeQuest.id)
                                }
                                style={{
                                    alignItems: "center",
                                    backgroundColor: "#00f",
                                    width: "70%",
                                    marginTop: 8,
                                    paddingVertical: 12,
                                    justifyContent: "center",
                                    borderRadius: 6,
                                }}
                            >
                                Update Quest
                            </PixelButton>
                        </View>
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
                    </>
                ) : (
                    <View style={styles.grid}>
                        <PixelText
                            fontSize={14}
                            color="#888"
                            style={{ marginBottom: 20 }}
                        >
                            You have no active quest.
                        </PixelText>
                    </View>
                )}

                {/* User's Achievements Section */}

                <PixelText
                    fontSize={20}
                    color="#0ff"
                    style={{ marginBottom: 20 }}
                >
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
                    <SectionList
                        sections={achievementSections}
                        keyExtractor={(item) => item.achievementId.toString()}
                        renderSectionHeader={({ section: { title } }) => (
                            <View
                                style={{
                                    width: "100%",
                                    paddingHorizontal: 10,
                                    paddingBottom: 10,
                                    backgroundColor: "#111",
                                }}
                            >
                                <PixelText
                                    fontSize={14}
                                    color="#0ff"
                                    style={{
                                        flexShrink: 1,
                                    }}
                                >
                                    {title}
                                </PixelText>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View
                                    style={{
                                        flex: 1,
                                        width: "100%",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <PixelText
                                        fontSize={12}
                                        color="#0ff"
                                        style={{
                                            marginBottom: 4,
                                            width: "100%",
                                        }}
                                    >
                                        {item.achievement.name}
                                    </PixelText>
                                    <ProgressBar
                                        progress={item.progress / 100}
                                        width={200}
                                        height={15}
                                        backgroundColor="#333"
                                        progressColor="#0ff"
                                        borderColor="#0ff"
                                    />
                                    {item.achievement.weeklyReset && (
                                        <PixelText
                                            fontSize={10}
                                            color="#0ff"
                                            style={{
                                                marginTop: 4,
                                                width: "100%",
                                            }}
                                        >
                                            Resets weekly 🔄
                                        </PixelText>
                                    )}
                                    <PixelText fontSize={10} color="#fff">
                                        {item.achievement.xp} XP
                                    </PixelText>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 300 }}
                    />
                )}
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
        flexGrow: 1,
        backgroundColor: "#111",
        alignItems: "stretch",
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
        width: "100%",
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
