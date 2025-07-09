import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import PixelText from "./PixelText";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";

interface Achievement {
    achievement: {
        name: string;
        xp: number;
        deadline: Date;
    };
    progress: number;
    customDeadline: Date;
}

interface PixelAchievementCardProps {
    achievement?: Achievement; // same shape as your state
}

export default function PixelAchievementCard({
    achievement: propAchievement,
}: PixelAchievementCardProps) {
    const [achievement, setAchievement] = useState<Achievement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievement = async () => {
            // if (propAchievement) {
            //     // If prop is provided, skip fetching
            //     setAchievement(propAchievement);
            //     setLoading(false);
            //     console.log("no prop achievement");
            //     return;
            // }
            try {
                const userId = await SecureStore.getItemAsync("userId");
                const data = await authFetch(`/user/getUserQuest/${userId}`);

                if (data && data.achievements && data.achievements.length > 0) {
                    setAchievement(data.achievements[0]);
                }
            } catch (err) {
                console.error("Error fetching achievement:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievement();
    }, [propAchievement]);

    function getDaysLeft(deadline: Date | string) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffMs = deadlineDate.getTime() - today.getTime();

        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    if (loading) {
        return (
            <View style={styles.card}>
                <ActivityIndicator color="#0ff" />
            </View>
        );
    }

    if (!achievement) {
        return (
            <View style={styles.card}>
                <PixelText fontSize={10} color="#fff">
                    No achievements in progress!
                </PixelText>
            </View>
        );
    }

    return (
        <View style={styles.card}>
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
                    🎯 {achievement.achievement.name}
                </PixelText>
                <PixelText fontSize={10} color="#fff">
                    {achievement.achievement.xp} XP
                </PixelText>
            </View>
            <PixelText fontSize={10} color="#fff">
                Days left:{" "}
                {getDaysLeft(
                    achievement.customDeadline ??
                        achievement.achievement.deadline
                )}
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
