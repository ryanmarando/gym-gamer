import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import CustomWorkoutModal from "../components/CustomWorkoutModal";
import { playPixelSound } from "../utils/playPixelSound";

export default function SaveWorkoutScreen() {
    const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
    const [allWorkouts, setAllWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCustomWorkoutModal, setShowCustomWorkoutModal] =
        useState<boolean>(false);

    const fetchWorkouts = async () => {
        try {
            const userId = await SecureStore.getItemAsync("userId");

            const userData = await authFetch(`/user/getUserWorkouts/${userId}`);
            const allData = await authFetch(`/workouts`);

            console.log("✅ Workout shop loaded");
            setUserWorkouts(userData.workouts);
            setAllWorkouts(allData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchWorkouts();
        }, [])
    );

    const isSaved = (workoutId: number) =>
        userWorkouts.some((w) => w.workoutId === workoutId);

    const filterWorkoutsByArchitype = (type: string) => {
        return allWorkouts.filter((w) => w.architype.includes(type));
    };

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

    const toggleCreateWorkout = () => {
        setShowCustomWorkoutModal(true);
    };

    const confirmCreateWorkout = async (data: {
        customName: string;
        architype: string[];
    }) => {
        try {
            // get userId from SecureStore or elsewhere
            const userIdStr = await SecureStore.getItemAsync("userId");
            if (!userIdStr) throw new Error("User ID not found");
            const userId = Number(userIdStr);

            const body = JSON.stringify({
                userId,
                customName: data.customName,
                architype: data.architype,
            });

            const result = await authFetch("/workouts/createCustomWorkout", {
                method: "POST",
                body,
            });

            console.log("Workout created:", result);
            fetchWorkouts();
        } catch (error) {
            console.error("Error creating workout:", error);
        }
    };

    const renderWorkoutItem = (item: any) => (
        <View style={styles.workoutItem}>
            <PixelText
                fontSize={12}
                color="#fff"
                style={{ flexShrink: 1, textAlign: "left" }}
            >
                {item.name}
            </PixelText>
            <TouchableOpacity
                onPress={() => {
                    toggleWorkout(item.id);
                    playPixelSound();
                }}
                style={[
                    styles.button,
                    {
                        backgroundColor: isSaved(item.id) ? "#f55" : "#0f0",
                    },
                ]}
            >
                <PixelText fontSize={12} color="#000">
                    {isSaved(item.id) ? "Remove" : "Save"}
                </PixelText>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <PixelText fontSize={20} color="#0ff" style={{ marginBottom: 10 }}>
                💪 Push Workouts
            </PixelText>
            <FlatList
                data={filterWorkoutsByArchitype("PUSH")}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderWorkoutItem(item)}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            <PixelText
                fontSize={20}
                color="#0ff"
                style={{ marginBottom: 10, marginTop: 10 }}
            >
                🏋️ Pull Workouts
            </PixelText>
            <FlatList
                data={filterWorkoutsByArchitype("PULL")}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderWorkoutItem(item)}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            <PixelText
                fontSize={20}
                color="#0ff"
                style={{ marginBottom: 10, marginTop: 10 }}
            >
                🦵 Legs Workouts
            </PixelText>
            <FlatList
                data={filterWorkoutsByArchitype("LEGS")}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderWorkoutItem(item)}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
            <View style={styles.bottomButtonContainer}>
                <PixelButton
                    text="Create your own workout"
                    onPress={toggleCreateWorkout}
                ></PixelButton>

                <CustomWorkoutModal
                    visible={showCustomWorkoutModal}
                    onConfirm={(data) => {
                        // POST to backend with data.userId, data.customName, data.architype (array)
                        confirmCreateWorkout(data);
                        setShowCustomWorkoutModal(false);
                    }}
                    onCancel={() => setShowCustomWorkoutModal(false)}
                />
            </View>
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
        paddingLeft: -6,
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
    bottomButtonContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
        marginBottom: "-17%",
    },
});
