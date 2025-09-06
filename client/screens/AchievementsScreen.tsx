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
import { playCompleteSound } from "../utils/playCompleteSound";
import { playExcitingSound } from "../utils/playExcitingSound";
import {
    getWeightUnit,
    convertWeight,
    getLocalizedAchievementName,
} from "../utils/unitUtils";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import * as SQLite from "expo-sqlite";
import { Quest, Achievement, UserWeightEntry } from "../types/db";

export default function AchievementsScreen({ navigation }: any) {
    const [achievements, setAchievements] = useState<Achievement[]>([]); // All achievements
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
    const [selectedSystem, setSelectedSystem] = useState<
        "IMPERIAL" | "METRIC"
    >();
    const [loading, setLoading] = useState(true);
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);

    // Prepare sections for SectionList
    const achievementSections = [
        {
            title: "In Progress Achievements",
            data: achievements.filter((ua) => !ua.completed),
        },
        {
            title: "Completed Achievements",
            data: achievements
                .filter((ua) => ua.completed && ua.completed_at)
                .sort(
                    (a, b) =>
                        new Date(b.completed_at!).getTime() -
                        new Date(a.completed_at!).getTime()
                ),
        },
    ];

    const fetchWeights = async (userId: number) => {
        try {
            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            const weights: UserWeightEntry[] = await db.getAllAsync(
                "SELECT * FROM user_weight_entries WHERE user_id = ? ORDER BY entered_at DESC",
                [userId]
            );

            if (weights.length > 0) {
                setCurrentWeight(weights[0].weight);
                return weights[0].weight;
            }
        } catch (err) {
            console.error("Error fetching weights from local DB:", err);
        }
    };

    const fetchActiveQuest = async () => {
        if (!userId) return;
        try {
            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            const quests: Quest[] = await db.getAllAsync(
                "SELECT * FROM quests WHERE user_id = ? LIMIT 1",
                [userId]
            );

            setActiveQuest(quests[0] || null);
        } catch (err) {
            console.error("Error fetching active quest from local DB:", err);
        }
    };

    const fetchAchievements = async () => {
        try {
            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            const achievements: Achievement[] = await db.getAllAsync(
                "SELECT * FROM achievements"
            );

            setAchievements(achievements);
        } catch (err) {
            console.error("Error fetching achievements from local DB:", err);
        }
    };

    // Fetch both achievements and user achievements whenever userId or refreshToggle changes
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const loadData = async () => {
                try {
                    setLoading(true);

                    const idStr = await SecureStore.getItemAsync("userId");
                    if (!idStr) return;
                    const id = Number(idStr);

                    if (!isActive) return;

                    setUserId(id);

                    const weightSystem = await SecureStore.getItemAsync(
                        "weightSystem"
                    );
                    if (
                        weightSystem === "METRIC" ||
                        weightSystem === "IMPERIAL"
                    ) {
                        setSelectedSystem(weightSystem);
                    }

                    fetchAchievements();
                    fetchActiveQuest();
                    fetchWeights(id);
                } catch (err) {
                    console.error("Error loading achievements data", err);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            loadData();

            return () => {
                isActive = false;
            };
        }, [refreshToggle])
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
        customType: "GAIN" | "LOSE" | "MAINTAIN";
        initialWeight: number;
    }) => {
        try {
            const userId = await SecureStore.getItemAsync("userId");
            const weightSystem = await SecureStore.getItemAsync("weightSystem");

            // // --- 1. Send API request ---
            // const result = await authFetch(`/quest/editQuest/${userId}`, {
            //     method: "PATCH",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ ...data, weightSystem: selectedSystem }),
            // });

            // --- 2. Update local SQLite DB ---
            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            const formattedType =
                data.customType.charAt(0).toUpperCase() +
                data.customType.slice(1).toLowerCase();

            let unit;
            if (weightSystem === "IMPERIAL") {
                unit = "lbs";
            } else {
                unit = "kg";
            }

            const deadlineDate = new Date(data.customDeadline);

            const formattedDeadline = isNaN(deadlineDate.getTime())
                ? data.customDeadline
                : deadlineDate.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                  });

            let questName;
            const dateSuffix =
                data.customType.toUpperCase() === "MAINTAIN"
                    ? `through ${formattedDeadline}`
                    : `by ${formattedDeadline}`;

            if (data.customType.toUpperCase() === "MAINTAIN") {
                questName = `${formattedType} ${data.initialWeight} ${unit} ${dateSuffix}`;
            } else {
                questName = `${formattedType} ${data.customGoalAmount} ${unit} ${dateSuffix}`;
            }

            await db.runAsync(
                `
            UPDATE quests
            SET goal = ?, goal_date = ?,  name = ?, initial_weight = ?
            WHERE user_id = ?
            `,
                [
                    data.customGoalAmount,
                    data.customDeadline,
                    questName,
                    data.initialWeight,
                    userId,
                ]
            );

            console.log("✅ Local quest updated!");

            // // --- 3. Handle new achievements ---
            // if (result.newlyCompletedAchievements?.length) {
            //     sendNotification(result.newlyCompletedAchievements);

            //     result.newlyCompletedAchievements.forEach((ach: any) => {
            //         console.log(`🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`);
            //     });
            // }

            playCompleteSound();
            setUpdateModalVisible(false);

            // Re-sync UI
            fetchActiveQuest();
            fetchAchievements();
        } catch (error) {
            console.error("❌ Failed to update quest:", error);
        }
    };

    const handleUpdatePress = (questId: number) => {
        setSelectedQuestId(questId);
        setUpdateModalVisible(true);
    };

    const calculateQuestProgress = (
        quest: { type: string; goal: number; initial_weight?: number },
        currentWeight: number | null
    ): number | null => {
        if (
            quest.initial_weight == null ||
            currentWeight == null ||
            quest.goal === 0
        ) {
            return null;
        }

        const isGain = quest.type === "GAIN";
        const isLose = quest.type === "LOSE";

        const numerator = isGain
            ? currentWeight - quest.initial_weight
            : isLose
            ? quest.initial_weight - currentWeight
            : 0;

        return Math.max(0, Math.min(1, numerator / quest.goal));
    };

    const confirmCompleteQuest = async (questId: number) => {
        const userId = await SecureStore.getItemAsync("userId");
        const currentBodyWeight = await fetchWeights(Number(userId));

        if (
            activeQuest &&
            currentBodyWeight !== null &&
            calculateQuestProgress(activeQuest, currentBodyWeight!)! < 1 &&
            activeQuest.type !== "MAINTAIN"
        ) {
            setModalConfirmationConfig({
                title: "Almost there, gamer!",
                message:
                    "You haven't completed your quest yet. Keep going to finish it!",
                onConfirm: () => setModalConfirmationVisible(false),
            });
            setModalConfirmationVisible(true);
            playBadMoveSound();
            return;
        }

        setModalConfig({
            title: "Wow, Gamer!",
            message: "Are you sure you want to complete your quest?",
            onConfirm: () => handleCompleteQuest(questId),
        });
        setModalVisible(true);
    };

    const handleCompleteQuest = async (questId: number) => {
        setModalVisible(false);

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
        setModalConfirmationConfig({
            title: "Amazing!",
            message: `You are a true gamer! You just gained ${result.xp} XP! Update your quest for another goal!`,
            onConfirm: () => setModalConfirmationVisible(false),
        });
        setModalConfirmationVisible(true);
        setShowConfetti(true);
        playExcitingSound();
        setTimeout(() => setShowConfetti(false), 4800);
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
                    🏆 Conquer With A Quest
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
                                containerStyle={{
                                    alignItems: "center",
                                    backgroundColor: "#00f",
                                    width: "70%",
                                    marginTop: 8,
                                    paddingVertical: 12,
                                    justifyContent: "center",
                                    borderRadius: 6,
                                }}
                            />

                            <PixelButton
                                fontSize={15}
                                color="#fff"
                                text="Complete Quest"
                                onPress={() =>
                                    confirmCompleteQuest(activeQuest.id)
                                }
                                containerStyle={{
                                    alignItems: "center",
                                    backgroundColor: "#f0f",
                                    width: "70%",
                                    marginTop: 8,
                                    paddingVertical: 12,
                                    justifyContent: "center",
                                    borderRadius: 6,
                                }}
                            />
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
                            confettiVisible={showConfetti}
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

                {achievements.length === 0 ? (
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
                        keyExtractor={(item) => item.id.toString()}
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
                                        {selectedSystem === "IMPERIAL"
                                            ? item.name
                                            : getLocalizedAchievementName(
                                                  item.name,
                                                  item.goal_type!,
                                                  item.target_value!,
                                                  selectedSystem!
                                              )}
                                    </PixelText>

                                    <PixelText
                                        fontSize={10}
                                        color="#0ff"
                                        style={{
                                            marginBottom: 4,
                                            width: "100%",
                                        }}
                                    >
                                        {selectedSystem === "IMPERIAL"
                                            ? item.description
                                            : item.goal_type === "LIFTINGWEIGHT"
                                            ? item.target_value
                                                ? `Lift at least ${convertWeight(
                                                      item.target_value,
                                                      selectedSystem!
                                                  )} ${getWeightUnit(
                                                      selectedSystem!
                                                  )}`
                                                : item.name
                                                      .toLowerCase()
                                                      .includes(
                                                          "lift a total"
                                                      ) && item.goal_amount
                                                ? `Lift a total of ${convertWeight(
                                                      item.goal_amount,
                                                      selectedSystem!
                                                  )} ${getWeightUnit(
                                                      selectedSystem!
                                                  )} in a week`
                                                : item.description
                                            : item.description}
                                    </PixelText>

                                    <ProgressBar
                                        progress={item.progress / 100}
                                        width={200}
                                        height={15}
                                        backgroundColor="#333"
                                        progressColor="#9B59B6"
                                        borderColor="#9B59B6"
                                    />

                                    {item.weekly_reset &&
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
                                                    {`Resets on ${nextReset.toLocaleDateString(
                                                        undefined,
                                                        {
                                                            weekday: "long",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )} at 11:59 PM — in ${diffHours}h ${diffMinutes}m`}
                                                </PixelText>
                                            );
                                        })()}

                                    <PixelText fontSize={10} color="#fff">
                                        {`${item.xp} XP`}
                                    </PixelText>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 700 }}
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
