// screens/WorkoutsScreen.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    TextInputProps,
    NativeSyntheticEvent,
    TextInputChangeEventData,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import PixelModal from "../components/PixelModal"; // Your modal component
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";

interface Workout {
    userId: number;
    workoutId: number;
    workout: {
        id: number;
        name: string;
    };
    entries: any[]; // Adjust as you expand entries shape
}

type WeightEntries = Record<number, number[]>; // workoutId -> array of weights

export default function WorkoutsScreen() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [weightEntries, setWeightEntries] = useState<WeightEntries>({});
    const [timer, setTimer] = useState<number>(0); // seconds elapsed
    const [workoutStarted, setWorkoutStarted] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState(
        "Are you sure you want to start a workout?"
    );
    const [modalAction, setModalAction] = useState<"start" | "complete" | null>(
        null
    );
    const [allWorkoutEntries, setAllWorkoutEntries] = useState<any[]>([]);

    const openStartModal = () => {
        setModalAction("start");
        setModalMessage("Are you sure you want to start a workout?");
        setShowModal(true);
    };

    const openCompleteModal = () => {
        setModalAction("complete");
        setModalMessage("Are you sure you want to complete the workout?");
        setShowModal(true);
    };

    const onModalConfirm = async () => {
        setShowModal(false);

        if (modalAction === "start") {
            setWorkoutStarted(true);
            setTimer(0);
        } else if (modalAction === "complete") {
            try {
                const userIdStr = await SecureStore.getItemAsync("userId");
                if (!userIdStr) return;
                const userId = Number(userIdStr);
                if (isNaN(userId)) return;

                // Save last weight entry for each workout
                for (const workout of workouts) {
                    const entries = weightEntries[workout.workoutId];
                    if (!entries || entries.length === 0) continue;
                    const maxWeight = Math.max(...entries.map(Number));

                    // Only send if lastWeight > 0 (optional)
                    if (maxWeight > 0) {
                        await authFetch(
                            `/workouts/addWorkoutEntry?userId=${userId}&workoutId=${workout.workoutId}`,
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    weight: maxWeight,
                                }),
                            }
                        );
                    }
                }

                // Now call complete workout endpoint
                await authFetch(`/workouts/completeWorkout/${userId}`, {
                    method: "PATCH",
                });

                setWorkoutStarted(false);
                setTimer(0);
                alert("Workout completed!");
            } catch (error) {
                console.error("Complete workout failed", error);
                alert("Failed to complete workout");
            }
        }

        setModalAction(null);
    };

    // Fetch workouts on mount
    useEffect(() => {
        fetchUserWorkouts();
    }, []);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (workoutStarted) {
            interval = setInterval(() => {
                setTimer((t) => t + 1);
            }, 1000);
        } else if (!workoutStarted && timer !== 0) {
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [workoutStarted, timer]);

    // Fetch user workouts from API
    const fetchUserWorkouts = useCallback(async () => {
        try {
            const userIdStr = await SecureStore.getItemAsync("userId");
            if (!userIdStr) return;
            const userId = Number(userIdStr);
            if (isNaN(userId)) return;

            const data = await authFetch(`/user/getUserWorkouts/${userId}`);
            setWorkouts(data.workouts || []);

            // Fetch all workout entries
            const entriesData = await authFetch(
                `/user/getUserWorkoutWeightEntries/${userId}`
            );
            setAllWorkoutEntries(entriesData.entries || []);

            // Initialize weight entries with default 3 zeros per workout
            const initialWeights: WeightEntries = {};
            data.workouts.forEach((w: Workout) => {
                initialWeights[w.workoutId] = [0, 0, 0];
            });
            setWeightEntries(initialWeights);
        } catch (error) {
            console.error("Failed to fetch workouts", error);
        }
    }, []);

    // Format seconds as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    // Handle changes in weight input
    const handleWeightChange = (
        workoutId: number,
        index: number,
        value: string
    ): void => {
        setWeightEntries((prev) => {
            const copy = { ...prev };
            const weights = copy[workoutId] ? [...copy[workoutId]] : [];
            const num = Number(value);
            weights[index] = isNaN(num) ? 0 : num;
            copy[workoutId] = weights;
            return copy;
        });
    };

    // Add one more weight entry box
    const addEntry = (workoutId: number): void => {
        setWeightEntries((prev) => {
            const copy = { ...prev };
            const arr = copy[workoutId] ? [...copy[workoutId]] : [];
            arr.push(0);
            copy[workoutId] = arr;
            return copy;
        });
    };

    // Remove last weight entry box
    const deleteEntry = (workoutId: number): void => {
        setWeightEntries((prev) => {
            const copy = { ...prev };
            if (copy[workoutId] && copy[workoutId].length > 0) {
                copy[workoutId] = copy[workoutId].slice(0, -1);
            }
            return copy;
        });
    };

    const getLastWorkoutWeight = (workoutId: number): number => {
        const entriesForWorkout = allWorkoutEntries.filter(
            (entry) => entry.userWorkout?.workoutId === workoutId
        );
        if (entriesForWorkout.length === 0) return 0;
        // Get the max weight from the most recent entry
        return entriesForWorkout[0].weight; // or do Math.max(...) if you want the max ever
    };

    return (
        <View style={styles.container}>
            <PixelText
                fontSize={20}
                color="#ff0"
                style={{ marginBottom: 12, textAlign: "center" }}
            >
                Push Day
            </PixelText>
            <PixelText
                fontSize={18}
                color="#0ff"
                style={{ marginBottom: 12, textAlign: "center" }}
            >
                Timer: {formatTime(timer)}
            </PixelText>

            {workoutStarted ? (
                <PixelButton
                    color="#f00"
                    text="Complete Workout"
                    onPress={openCompleteModal}
                    containerStyle={{
                        marginTop: 20,
                        backgroundColor: "#000",
                        borderColor: "#f00",
                    }}
                />
            ) : (
                <PixelButton
                    text="Start Workout"
                    onPress={openStartModal}
                    containerStyle={{ marginTop: 20 }}
                />
            )}

            <FlatList
                data={workouts}
                keyExtractor={(item) => item.workoutId.toString()}
                style={{ flex: 1 }}
                renderItem={({ item }) => (
                    <View style={styles.workoutCard}>
                        <View style={{ flex: 1 }}>
                            <PixelText
                                fontSize={14}
                                color="#0f0"
                                style={{
                                    marginBottom: 4,
                                    textAlign: "left",
                                    paddingLeft: -12,
                                }}
                            >
                                {item.workout.name}
                            </PixelText>
                            <PixelText
                                fontSize={10}
                                color="#fff"
                                style={{
                                    marginBottom: 8,
                                    textAlign: "left",
                                    paddingLeft: -12,
                                    width: 1000,
                                }}
                            >
                                Reps: 10, Failure, Failure{" "}
                                {/* hardcoded for now */}
                            </PixelText>

                            <PixelText
                                fontSize={10}
                                color="#fff"
                                style={{
                                    marginBottom: 8,
                                    textAlign: "left",
                                    paddingLeft: -12,
                                }}
                            >
                                {`Max weight: ${getLastWorkoutWeight(
                                    item.workoutId
                                )} lbs`}
                            </PixelText>

                            <View style={{ flexDirection: "row", gap: 8 }}>
                                {(weightEntries[item.workoutId] || []).map(
                                    (weight, i) => (
                                        <TextInput
                                            key={i}
                                            keyboardType="numeric"
                                            value={weight.toString()}
                                            onChangeText={(v) =>
                                                handleWeightChange(
                                                    item.workoutId,
                                                    i,
                                                    v
                                                )
                                            }
                                            style={styles.weightInput}
                                            placeholder="0"
                                            placeholderTextColor="#555"
                                        />
                                    )
                                )}
                            </View>
                        </View>

                        <View style={styles.buttonsColumn}>
                            <PixelButton
                                text="+"
                                onPress={() => addEntry(item.workoutId)}
                                containerStyle={{ marginBottom: 8, width: 40 }}
                            />
                            <PixelButton
                                text="-"
                                onPress={() => deleteEntry(item.workoutId)}
                                containerStyle={{ width: 40 }}
                            />
                        </View>
                    </View>
                )}
            />

            <PixelModal
                visible={showModal}
                onConfirm={onModalConfirm}
                onCancel={() => setShowModal(false)}
                title={
                    modalAction === "start"
                        ? "Start Workout"
                        : "Complete Workout"
                }
                message={modalMessage}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: "20%",
    },
    workoutCard: {
        backgroundColor: "#222",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 8,
        padding: 12,
        marginVertical: 6,
        flexDirection: "row",
        alignItems: "center",
    },
    weightInput: {
        backgroundColor: "#333",
        color: "#0ff",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 4,
        width: 70,
        height: 40,
        paddingHorizontal: 8,
        fontFamily: "PressStart2P_400Regular", // pixel font
    },
    buttonsColumn: {
        marginLeft: 12,
        justifyContent: "center",
        alignItems: "center",
    },
});
