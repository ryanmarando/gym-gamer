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

interface Quest {
    name: string;
    type: string;
    goal: number;
    goalDate: Date | string;
    initialWeight?: number | null;
    baseXP: number;
}

interface WeightEntry {
    enteredAt: string;
    weight: number;
}

interface PixelQuestCardProps {
    quest?: Quest;
    containerStyle?: ViewStyle;
}

export default function PixelQuestCard({
    quest: propQuest,
    containerStyle,
}: PixelQuestCardProps) {
    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);

    const fetchWeights = async (userId: string) => {
        try {
            const data = await authFetch(
                `/user/getAllUserWeightEntries/${userId}`
            );
            console.log(data.user.weightEntires);
            if (
                data?.user?.weightEntries &&
                data.user.weightEntries.length > 0
            ) {
                // Sort descending by enteredAt to get latest first
                const sorted = data.user.weightEntries.sort(
                    (a: WeightEntry, b: WeightEntry) =>
                        new Date(b.enteredAt).getTime() -
                        new Date(a.enteredAt).getTime()
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
            //     if (propQuest.initialWeight != null) {
            //         const userId = await SecureStore.getItemAsync("userId");
            //         if (userId) await fetchWeights(userId);
            //     }
            //     setLoading(false);
            //     return;
            // }

            try {
                const userId = await SecureStore.getItemAsync("userId");
                if (!userId) throw new Error("Missing userId");

                const data = await authFetch(`/user/getUserQuest/${userId}`);
                if (data && data.quest) {
                    setQuest(data.quest);

                    if (data.quest.initialWeight != null) {
                        await fetchWeights(userId);
                    }
                }
            } catch (err) {
                console.error("Error fetching quest:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestAndWeights();
    }, [propQuest]);

    function getProgress() {
        if (!quest || quest.initialWeight == null || currentWeight == null)
            return null;

        const isGain = quest.type === "GAIN";
        const isLose = quest.type === "LOSE";

        const goal = quest.goal;

        if (goal === 0) return 0;

        const numerator = isGain
            ? currentWeight - quest.initialWeight
            : isLose
            ? quest.initialWeight - currentWeight
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
                {quest.type !== "MAINTAIN" && (
                    <>
                        <PixelText fontSize={12} color="#0ff">
                            🎯 {quest.name}
                        </PixelText>
                    </>
                )}
                {quest.type === "MAINTAIN" && (
                    <View>
                        <PixelText fontSize={12} color="#0ff">
                            🎯 Maintain {quest.initialWeight} lbs through{" "}
                            {new Date(quest.goalDate).toLocaleDateString(
                                "en-US",
                                {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                }
                            )}
                            !
                        </PixelText>
                        <View
                            style={{
                                position: "absolute",
                                right: -62,
                                top: -45,
                            }}
                        >
                            <PixelText
                                fontSize={10}
                                color="#3B2F2F"
                                style={{
                                    position: "absolute",
                                    zIndex: 10,
                                    bottom: Platform.OS === "ios" ? 25 : 25,
                                    textAlign: "center",
                                }}
                            >
                                Worth {quest.baseXP * quest.goal} XP!
                            </PixelText>
                            <Image
                                source={require("../assets/RewardPixel.png")}
                                style={{
                                    width: 125,
                                    height: 125,
                                }}
                            />
                        </View>
                    </View>
                )}
            </View>
            {quest.initialWeight == null ? (
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
                                style={{
                                    marginBottom: 4,
                                    width: "70%",
                                    lineHeight: 12,
                                }}
                            >
                                Weight Goal:{" "}
                                {quest.type === "GAIN"
                                    ? quest.initialWeight + quest.goal
                                    : quest.initialWeight - quest.goal}{" "}
                                lbs
                            </PixelText>

                            {currentWeight !== null && (
                                <PixelText
                                    fontSize={10}
                                    color="#fff"
                                    style={{ marginBottom: 4 }}
                                >
                                    {Math.max(
                                        0,
                                        quest.type === "GAIN"
                                            ? quest.initialWeight +
                                                  quest.goal -
                                                  currentWeight
                                            : currentWeight -
                                                  (quest.initialWeight -
                                                      quest.goal)
                                    ).toFixed(1)}{" "}
                                    lbs to go!
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
                                    fontSize={10}
                                    color="#3B2F2F"
                                    style={{
                                        position: "absolute",
                                        zIndex: 10,
                                        bottom: Platform.OS === "ios" ? 15 : 10,
                                        textAlign: "center",
                                    }}
                                >
                                    Worth {quest.baseXP * quest.goal} XP!
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
                Days left: {getDaysLeft(quest.goalDate)}
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
