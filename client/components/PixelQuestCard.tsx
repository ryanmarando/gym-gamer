import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import PixelText from "./PixelText";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";

interface Quest {
    name: string; // e.g., "Gain 10 lbs by Aug 12, 2025"
    type: string; // "GAIN" or "LOSE"
    goal: number;
    goalDate: Date | string;
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

    useEffect(() => {
        const fetchQuest = async () => {
            if (propQuest) {
                setQuest(propQuest);
                setLoading(false);
                return;
            }

            try {
                const userId = await SecureStore.getItemAsync("userId");
                const data = await authFetch(`/user/getUserQuest/${userId}`);

                if (data && data.quest) {
                    setQuest(data.quest);
                }
            } catch (err) {
                console.error("Error fetching quest:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuest();
    }, [propQuest]);

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
                numberOfLines={1}
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
                <PixelText fontSize={12} color="#0ff">
                    🎯 {quest.name}
                </PixelText>
            </View>
            <PixelText fontSize={10} color="#fff">
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
