import React, { useEffect, useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, SectionList } from "react-native";
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
import { sendPushNotification } from "../utils/notification";
import Celebration from "../components/Celebration";
import { getNextSundayReset } from "../utils/getNextSundayReset";

interface AchievementDetails {
    id: number;
    name: string;
    xp: number;
    weeklyReset: boolean;
    description: string;
}

interface UserAchievement {
    userId: number;
    achievementId: number;
    progress: number;
    completed: boolean;
    isQuest: boolean;
    achievement: AchievementDetails;
    completedAt: number;
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
    baseXP: number;
}

export default function AchievementsScreen({ navigation }: any) {
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
    const [showConfetti, setShowConfetti] = useState(false);

    // Prepare sections for SectionList
    const achievementSections = [
        {
            title: "Completed Achievements",
            data: userAchievements
                .filter((ua) => ua.completed && ua.completedAt)
                .sort(
                    (a, b) =>
                        new Date(b.completedAt).getTime() -
                        new Date(a.completedAt).getTime()
                ),
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

    const fetchAchievements = async () => {
        const data = await authFetch("/achievement");
        setAchievements(data || []);
    };

    const fetchUserAchievements = async () => {
        const data = await authFetch(`/user/getUserAchievements/${userId}`);
        const achievements = data?.achievements || [];
        setUserAchievements(achievements);
    };

    // Fetch both achievements and user achievements whenever userId or refreshToggle changes
    useFocusEffect(
        useCallback(() => {
            console.log("✅ Achivements loaded");

            if (userId === null) return;

            fetchAchievements();
            fetchUserAchievements();
            fetchActiveQuest();

            // Optionally return a cleanup function if needed
            return () => {
                // cleanup if necessary
            };
        }, [userId, refreshToggle])
    );

    const sendNotification = async (newCompletedAchievements: any[]) => {
        const expoPushToken = await SecureStore.getItemAsync("notifToken");
        console.log("Push token:", expoPushToken);
        if (!expoPushToken) {
            return;
        }

        const title = "Hey, Gym Gamer!";
        let body: string;

        if (newCompletedAchievements.length === 1) {
            const achievementName = newCompletedAchievements[0].name;
            body = `🏆 You completed '${achievementName}'!`;
        } else {
            body = `🏆 You completed ${newCompletedAchievements.length} achievements!`;
        }

        await sendPushNotification({ expoPushToken, title, body });
    };

    const handleQuestUpdateConfirm = async (data: {
        customGoalAmount: number;
        customDeadline: string;
    }) => {
        try {
            const userId = await SecureStore.getItemAsync("userId");
            const result = await authFetch(`/quest/editQuest/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (result.newlyCompletedAchievements?.length) {
                // Send notification
                sendNotification(result.newlyCompletedAchievements);

                result.newlyCompletedAchievements.forEach((ach: any) => {
                    console.log(`🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`);
                    // Show modal, play sound, push notification, etc.
                });
            }
            console.log("Quest updated!");
            setUpdateModalVisible(false);
            fetchActiveQuest();
            fetchUserAchievements();
            fetchAchievements();
        } catch (error) {
            console.error("Failed to update quest:", error);
        }
    };

    const handleUpdatePress = (questId: number) => {
        setSelectedQuestId(questId);
        setUpdateModalVisible(true);
    };

    const confirmCompleteQuest = (questId: number) => {
        setModalConfig({
            title: "Wow, Gamer!",
            message: "Are your sure you want to complete your quest!?",
            onConfirm: () => handleCompleteQuest(questId),
        });
        setModalVisible(true);
    };

    const handleCompleteQuest = async (questId: number) => {
        const result = await authFetch(`/quest/completeQuest/${userId}`);

        if (result.newlyCompletedAchievements?.length) {
            // Send notification
            sendNotification(result.newlyCompletedAchievements);

            result.newlyCompletedAchievements.forEach((ach: any) => {
                console.log(`🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`);
                // Show modal, play sound, push notification, etc.
            });
        }
        fetchAchievements();
        fetchUserAchievements();
        setModalVisible(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {showConfetti && <Celebration />}
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
                            ></PixelButton>
                            <PixelButton
                                fontSize={15}
                                color="#fff"
                                text="Complete Quest"
                                onPress={() =>
                                    confirmCompleteQuest(activeQuest.id)
                                }
                                style={{
                                    alignItems: "center",
                                    backgroundColor: "#f0f",
                                    width: "70%",
                                    marginTop: 8,
                                    paddingVertical: 12,
                                    justifyContent: "center",
                                    borderRadius: 6,
                                }}
                            ></PixelButton>
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
                                        color="#0f0"
                                        style={{
                                            marginBottom: 4,
                                            width: "100%",
                                        }}
                                    >
                                        {item.achievement.name}
                                    </PixelText>
                                    <PixelText
                                        fontSize={10}
                                        color="#0ff"
                                        style={{
                                            marginBottom: 4,
                                            width: "100%",
                                        }}
                                    >
                                        {item.achievement.description}
                                    </PixelText>
                                    <ProgressBar
                                        progress={item.progress / 100}
                                        width={200}
                                        height={15}
                                        backgroundColor="#333"
                                        progressColor="#9B59B6" // Electric Purple
                                        borderColor="#9B59B6"
                                    />

                                    {item.achievement.weeklyReset &&
                                        (() => {
                                            const {
                                                nextReset,
                                                diffHours,
                                                diffMinutes,
                                            } = getNextSundayReset();
                                            return (
                                                <PixelText
                                                    fontSize={10}
                                                    color="#0ff"
                                                    style={{
                                                        marginTop: 4,
                                                        width: "100%",
                                                    }}
                                                >
                                                    Resets on{" "}
                                                    {nextReset.toLocaleDateString(
                                                        undefined,
                                                        {
                                                            weekday: "long",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}{" "}
                                                    at 11:59 PM — in {diffHours}
                                                    h {diffMinutes}m
                                                </PixelText>
                                            );
                                        })()}

                                    <PixelText fontSize={10} color="#fff">
                                        {item.achievement.xp} XP
                                    </PixelText>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 400 }}
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
