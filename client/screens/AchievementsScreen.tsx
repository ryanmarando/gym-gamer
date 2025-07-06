import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import PixelText from "../components/PixelText";
import ProgressBar from "../components/ProgressBar";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";

interface AchievementDetails {
    id: number;
    name: string;
    xp: number;
    // ...other fields if needed
}

interface UserAchievement {
    userId: number;
    achievementId: number;
    progress: number;
    completed: boolean;
    achievement: AchievementDetails;
}

export default function AchievementsScreen() {
    const [achievements, setAchievements] = useState<AchievementDetails[]>([]); // All achievements
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
        []
    ); // User's achievements
    const [userId, setUserId] = useState<number | null>(null);
    const [refreshToggle, setRefreshToggle] = useState(false); // to trigger refresh

    useEffect(() => {
        const fetchUserId = async () => {
            const idStr = await SecureStore.getItemAsync("userId");
            if (idStr) setUserId(Number(idStr));
        };
        fetchUserId();
    }, []);

    // Fetch both achievements and user achievements whenever userId or refreshToggle changes
    useEffect(() => {
        if (userId === null) return;

        const fetchAchievements = async () => {
            const data = await authFetch("/achievement");
            setAchievements(data || []);
        };

        const fetchUserAchievements = async () => {
            const data = await authFetch(`/user/getUserAchievements/${userId}`);
            // Assuming data.achievements is the array of user achievements:
            setUserAchievements(data?.achievements || []);
        };

        fetchAchievements();
        fetchUserAchievements();
    }, [userId, refreshToggle]);

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
            {/* User's Achievements Section */}
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
