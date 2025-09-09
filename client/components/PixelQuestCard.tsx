import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    Platform,
    Image,
} from "react-native";
import PixelText from "./PixelText";
import ProgressBar from "./ProgressBar";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import { convertWeight, getWeightUnit } from "../utils/unitUtils";
import { getConvertedQuestFields } from "../utils/unitUtils";
import * as SQLite from "expo-sqlite";
import { Quest, UserWeightEntry } from "../types/db";

interface PixelQuestCardProps {
    quest?: Partial<Quest>;
    containerStyle?: ViewStyle;
}

export default function PixelQuestCard({
    quest: propQuest,
    containerStyle,
}: PixelQuestCardProps) {
    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);
    const [weightSystem, setWeightSystem] = useState<string>();

    const fetchWeights = async () => {
        try {
            const db = await SQLite.openDatabaseAsync("gymgamer.db");
            const userBodyWeightData: UserWeightEntry[] = await db.getAllAsync(
                "SELECT * FROM user_weight_entries"
            );

            if (userBodyWeightData && userBodyWeightData.length > 0) {
                // Sort descending by enteredAt to get latest first
                const sorted = userBodyWeightData.sort(
                    (a: UserWeightEntry, b: UserWeightEntry) =>
                        new Date(b.entered_at).getTime() -
                        new Date(a.entered_at).getTime()
                );
                setCurrentWeight(sorted[0].weight);
            } else {
                setCurrentWeight(null);
            }
        } catch (err) {
            console.error("Error fetching weights:", err);
            setCurrentWeight(null);
        }
    };

    useEffect(() => {
        const fetchQuestAndWeights = async () => {
            // if (propQuest) {
            //     setQuest(propQuest);
            //     if (propQuest.initial_weight != null) {
            //         const userId = await SecureStore.getItemAsync("userId");
            //         if (userId) await fetchWeights(userId);
            //     }
            //     setLoading(false);
            //     return;
            // }

            try {
                const weightSystem = await SecureStore.getItemAsync(
                    "weightSystem"
                );
                if (weightSystem) setWeightSystem(weightSystem);

                await fetchWeights();

                const db = await SQLite.openDatabaseAsync("gymgamer.db");

                const localUserQuest: Quest[] = await db.getAllAsync(
                    "SELECT * FROM quests"
                );

                setQuest(localUserQuest[0]);
            } catch (err) {
                console.error("Error fetching quest:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestAndWeights();
    }, [propQuest]);

    function getProgress() {
        if (!quest || quest.initial_weight == null || currentWeight == null)
            return null;

        const isGain = quest.type === "GAIN";
        const isLose = quest.type === "LOSE";

        const goal = quest.goal;

        if (goal === 0) return 0;

        const numerator = isGain
            ? currentWeight - quest.initial_weight
            : isLose
            ? quest.initial_weight - currentWeight
            : 0;

        return Math.max(0, Math.min(1, numerator / goal));
    }

    function getDaysLeft(goalDate: Date | string) {
        const date = new Date(goalDate);
        const today = new Date();
        const diffMs = date.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    if (loading) {
        return (
            <View style={styles.card}>
                <ActivityIndicator color="#0ff" />
            </View>
        );
    }

    if (!quest) {
        return (
            <View style={styles.card}>
                <PixelText fontSize={10} color="#fff">
                    No quest found. Get one!
                </PixelText>
            </View>
        );
    }

    return (
        <View style={[styles.card, containerStyle]}>
            <PixelText
                color="#ff0"
                style={{ marginBottom: 6, width: "100%", textAlign: "center" }}
            >
                Keep going gamer!
            </PixelText>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                }}
            >
                <>
                    <PixelText fontSize={12} color="#0ff">
                        🎯{" "}
                        {weightSystem === "METRIC"
                            ? getConvertedQuestFields(quest, "METRIC").name
                            : quest.name}
                    </PixelText>
                </>
            </View>
            {quest.initial_weight == null ? (
                <View
                    style={{
                        borderRadius: 12,
                        borderColor: "#fff",
                        borderWidth: 2,
                        padding: 8,
                    }}
                >
                    <PixelText
                        fontSize={10}
                        color="#fff"
                        style={{ marginBottom: 4, marginTop: 4 }}
                    >
                        Enter bodyweight to track progress and/or update quest
                        with intial bodyweight
                    </PixelText>
                </View>
            ) : getProgress() === null ? (
                <PixelText
                    fontSize={10}
                    color="#fff"
                    style={{ marginBottom: 4 }}
                >
                    No weight entries found to track progress
                </PixelText>
            ) : (
                <>
                    {quest.type !== "MAINTAIN" && (
                        <>
                            <PixelText
                                fontSize={10}
                                color="#fff"
                                style={{ marginBottom: 4 }}
                            >
                                Weight Goal:{" "}
                                {weightSystem === "METRIC"
                                    ? Math.round(
                                          convertWeight(
                                              quest.type === "GAIN"
                                                  ? quest.initial_weight +
                                                        quest.goal
                                                  : quest.initial_weight -
                                                        quest.goal,
                                              "METRIC"
                                          ) * 2
                                      ) / 2
                                    : Math.round(
                                          (quest.type === "GAIN"
                                              ? quest.initial_weight +
                                                quest.goal
                                              : quest.initial_weight -
                                                quest.goal) * 2
                                      ) / 2}{" "}
                                {getWeightUnit(weightSystem!)}
                            </PixelText>

                            {currentWeight !== null && (
                                <PixelText
                                    fontSize={10}
                                    color="#fff"
                                    style={{ marginBottom: 4 }}
                                >
                                    {weightSystem === "METRIC"
                                        ? Math.round(
                                              convertWeight(
                                                  Math.max(
                                                      0,
                                                      quest.type === "GAIN"
                                                          ? quest.initial_weight +
                                                                quest.goal -
                                                                currentWeight
                                                          : currentWeight -
                                                                (quest.initial_weight -
                                                                    quest.goal)
                                                  ),
                                                  "METRIC"
                                              ) * 2
                                          ) / 2
                                        : Math.round(
                                              Math.max(
                                                  0,
                                                  quest.type === "GAIN"
                                                      ? quest.initial_weight +
                                                            quest.goal -
                                                            currentWeight
                                                      : currentWeight -
                                                            (quest.initial_weight -
                                                                quest.goal)
                                              ) * 2
                                          ) / 2}{" "}
                                    {getWeightUnit(weightSystem!)} to go!
                                </PixelText>
                            )}

                            <View
                                style={{
                                    position: "absolute",
                                    flex: 1,
                                    right: -45,
                                    top: -3,
                                }}
                            >
                                <PixelText
                                    fontSize={11}
                                    color="#3B2F2F"
                                    style={{
                                        position: "absolute",
                                        zIndex: 10,
                                        bottom: Platform.OS === "ios" ? 15 : 10,
                                        textAlign: "center",
                                    }}
                                >
                                    Worth {quest.base_xp * quest.goal} XP!
                                </PixelText>
                                <Image
                                    source={require("../assets/RewardPixel.png")}
                                    style={{
                                        width: 120,
                                        height: 120,
                                    }}
                                />
                            </View>

                            <PixelText
                                fontSize={10}
                                color="#fff"
                                style={{ marginTop: 4, marginBottom: 4 }}
                            >
                                Quest Progress:
                            </PixelText>

                            <View style={{ marginBottom: 4, width: "100%" }}>
                                <ProgressBar
                                    progress={getProgress()!}
                                    width="100%"
                                    height={12}
                                />
                            </View>
                        </>
                    )}
                </>
            )}
            <PixelText fontSize={10} color="#fff" style={{ marginTop: 4 }}>
                Days left: {getDaysLeft(quest.goal_date)}
            </PixelText>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#111",
        borderColor: "#0ff",
        borderWidth: 3,
        borderRadius: 6,
        padding: 10,
        width: "77%",
        marginVertical: 10,
        alignItems: "center",
    },
});
