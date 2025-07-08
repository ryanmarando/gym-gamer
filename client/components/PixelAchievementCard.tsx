import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";

interface Achievement {
    achievement: {
        name: string;
        xp: number;
    };
    progress: number; // 0 to goal
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
            if (propAchievement) {
                // If prop is provided, skip fetching
                setAchievement(propAchievement);
                setLoading(false);
                return;
            }
            try {
                const userId = await SecureStore.getItemAsync("userId");
                const data = await authFetch(
                    `/user/getMostProgressedAchivement/${userId}`
                );

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
    }, [propAchievement]); // ✅ watch the prop

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
