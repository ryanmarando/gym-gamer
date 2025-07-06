import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import PixelText from "../components/PixelText";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";

export default function WorkoutsScreen() {
    const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
    const [allWorkouts, setAllWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkouts = async () => {
        try {
            const userId = await SecureStore.getItemAsync("userId");

            const userData = await authFetch(`/user/getUserWorkouts/${userId}`);
            const allData = await authFetch(`/workouts`);
            console.log(userData.workouts);
            setUserWorkouts(userData.workouts);
            setAllWorkouts(allData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const isSaved = (workoutId: number) =>
        userWorkouts.some((w) => w.workoutId === workoutId);

    const toggleWorkout = async (workoutId: number) => {
        try {
            const userId = Number(await SecureStore.getItemAsync("userId"));
            if (isSaved(workoutId)) {
                await authFetch(
                    `/workouts/deleteFromUser?userId=${userId}&workoutId=${workoutId}`,
                    { method: "DELETE" }
                );
                setUserWorkouts((prev) =>
                    prev.filter((w) => w.id !== workoutId)
                );
                fetchWorkouts();
            } else {
                await authFetch(
                    `/workouts/saveToUser?userId=${userId}&workoutId=${workoutId}`,
                    { method: "PATCH" }
                );
                const added = allWorkouts.find((w) => w.id === workoutId);
                if (added) setUserWorkouts((prev) => [...prev, added]);
                fetchWorkouts();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#0ff" size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PixelText fontSize={20} color="#0ff">
                💪 Your Workouts
            </PixelText>

            <FlatList
                data={allWorkouts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.workoutItem}>
                        <PixelText fontSize={14} color="#fff">
                            {item.name}
                        </PixelText>
                        <TouchableOpacity
                            onPress={() => toggleWorkout(item.id)}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: isSaved(item.id)
                                        ? "#f55"
                                        : "#0f0",
                                },
                            ]}
                        >
                            <PixelText fontSize={12} color="#000">
                                {isSaved(item.id) ? "Remove" : "Save"}
                            </PixelText>
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={{ paddingVertical: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: 20,
        paddingVertical: "20%",
    },
    workoutItem: {
        backgroundColor: "#222",
        padding: 15,
        marginVertical: 8,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
});
