// screens/WorkoutsScreen.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, FlatList, TextInput } from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import PixelModal from "../components/PixelModal";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import WorkoutSplitModal from "../components/WorkoutSplitModal";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import PickWorkoutDay from "../components/PickWorkoutDay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    sendPushNotification,
    registerForPushNotificationsAsync,
} from "../utils/notification";

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

export default function WorkoutsScreen({ navigation }: any) {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [weightEntries, setWeightEntries] = useState<WeightEntries>({});
    const [timer, setTimer] = useState<number>(0); // seconds elapsed
    const [workoutStarted, setWorkoutStarted] = useState<boolean>(false);
    const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(
        null
    );
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showConfirmationModal, setShowConfirmationModal] =
        useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState(
        "Are you sure you want to start a workout?"
    );
    const [modalConfirmationTitle, setmodalConfirmationTitle] =
        useState("Whoa there, gamer!");
    const [modalAction, setModalAction] = useState<"start" | "complete" | null>(
        null
    );
    const [allWorkoutEntries, setAllWorkoutEntries] = useState<any[]>([]);
    const [workoutDays, setWorkoutDays] = useState<string[]>([]);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitName, setSplitName] = useState("");
    const [splitDays, setSplitDays] = useState<string[]>(["", "", ""]);

    const addSplitDay = () => {
        if (splitDays.length < 7) {
            setSplitDays((prev) => [...prev, ""]);
        }
    };

    const removeSplitDay = () => {
        if (splitDays.length > 3) {
            setSplitDays((prev) => prev.slice(0, -1));
        }
    };

    const updateSplitDay = (index: number, value: string) => {
        setSplitDays((prev) => {
            const copy = [...prev];
            copy[index] = value;
            return copy;
        });
    };

    const handleSplitConfirm = async () => {
        if (splitDays.some((d) => d.trim() === "")) {
            alert("Please fill in all day names.");
            return;
        }

        const cleanedDays = splitDays.map((day) => day.trim().toUpperCase());

        // TODO: Save or update split logic here
        console.log("Saving split:", splitName, cleanedDays);

        try {
            const userIdStr = await SecureStore.getItemAsync("userId");
            const userId = Number(userIdStr);
            await authFetch(`/workouts/assignWorkoutSplit/${userId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    days: cleanedDays,
                }),
            });
        } catch (error) {
            console.error("Couldn't update");
            return;
        }

        // Close modal & reset inputs
        fetchUserData();
        fetchUserWorkouts();
        setShowSplitModal(false);
        setSplitName("");
        setSplitDays(["", "", ""]);
    };

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

    const resetWeightEntries = () => {
        const reset: any = {};
        for (const workoutId in weightEntries) {
            // Reset to same length but with 0s
            reset[workoutId] = new Array(weightEntries[workoutId].length).fill(
                0
            );
        }
        setWeightEntries(reset);
    };

    const onModalConfirm = async () => {
        setShowModal(false);

        if (modalAction === "start") {
            const now = Date.now();
            setWorkoutStarted(true);
            setWorkoutStartTime(now);
            await AsyncStorage.setItem("workoutStartTime", now.toString());
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
                const workoutEndTime = new Date().toISOString();
                const workoutProgressData = await authFetch(
                    `/workouts/completeWorkout/${userId}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            duration: timer,
                            workoutEndTime: workoutEndTime,
                        }),
                    }
                );

                if (workoutProgressData.newlyCompletedAchievements?.length) {
                    // Send notification
                    sendNotification(
                        workoutProgressData.newlyCompletedAchievements?.length
                    );

                    workoutProgressData.newlyCompletedAchievements.forEach(
                        (ach: any) => {
                            console.log(
                                `🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`
                            );
                            // Show modal, play sound, push notification, etc.
                        }
                    );
                }

                setWorkoutStarted(false);
                setWorkoutStartTime(null);
                setTimer(0);
                await AsyncStorage.removeItem("workoutStartTime");
                setmodalConfirmationTitle("Nice work, gamer!");
                setModalMessage("Workout complete! You just gained XP!");
                setShowConfirmationModal(true);
                resetWeightEntries();
            } catch (error) {
                console.error("Complete workout failed", error);
                alert("Failed to complete workout");
            }
        }

        setModalAction(null);
    };

    const sendNotification = async (numberOfNew: number) => {
        const expoPushToken = await SecureStore.getItemAsync("notifToken");
        console.log("Push token:", expoPushToken);
        if (!expoPushToken) {
            return;
        }
        const title = "Hey, Gym Gamer!";
        let body: string;
        if (numberOfNew === 1) {
            body = `You completed an achievement!`;
        } else {
            body = `You completed ${numberOfNew} achievements!`;
        }
        await sendPushNotification({ expoPushToken, title, body });
    };

    const fetchUserData = useCallback(async () => {
        try {
            const userIdStr = await SecureStore.getItemAsync("userId");
            if (!userIdStr) return;
            const userId = Number(userIdStr);

            const userData = await authFetch(`/user/${userId}`);

            if (
                userData &&
                userData.workoutSplit &&
                userData.workoutSplit.length > 0
            ) {
                // Get the days array of the first split (assuming one)
                const days = userData.workoutSplit[0].days
                    .sort((a: any, b: any) => a.dayIndex - b.dayIndex)
                    .map((d: any) => d.dayName);

                setWorkoutDays(days);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    // Fetch user workouts from API
    const fetchUserWorkouts = useCallback(async () => {
        try {
            const userIdStr = await SecureStore.getItemAsync("userId");
            if (!userIdStr) return;

            if (!selectedDay) return;

            const data = await authFetch(
                `/user/getUserWorkoutsByArchitype/${userIdStr}/${selectedDay}`
            );

            setWorkouts(data.workouts || []);
            setAllWorkoutEntries(data.workouts);

            // ✅ Reset the weightEntries so each workout has 3 boxes
            setWeightEntries((prev) => {
                const copy = { ...prev };

                (data.workouts || []).forEach((w: Workout) => {
                    if (!copy[w.workoutId]) {
                        // Only initialize if missing
                        copy[w.workoutId] = [0, 0, 0];
                    }
                });

                return copy;
            });
        } catch (err) {
            console.log("No workouts found.");
            //console.error(err);
        }
    }, [selectedDay]);

    // Fetch workouts on mount
    useEffect(() => {
        fetchUserData();
        fetchUserWorkouts();
        const restoreStartTime = async () => {
            const savedTime = await AsyncStorage.getItem("workoutStartTime");
            if (savedTime) {
                setWorkoutStarted(true);
                setWorkoutStartTime(Number(savedTime));
            }
        };
        restoreStartTime();
    }, [fetchUserWorkouts, fetchUserData]);

    useFocusEffect(
        useCallback(() => {
            if (selectedDay) {
                console.log("Fetched lastest workouts");
                fetchUserWorkouts();
            }
        }, [selectedDay, fetchUserWorkouts])
    );

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (workoutStarted && workoutStartTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const elapsedSeconds = Math.floor(
                    (now - workoutStartTime) / 1000
                );
                setTimer(elapsedSeconds);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [workoutStarted, workoutStartTime]);

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
        // Find the workout in allWorkoutEntries
        const workout = allWorkoutEntries.find(
            (w) => w.workoutId === workoutId
        );

        if (!workout || !workout.entries || workout.entries.length === 0) {
            return 0;
        }

        // Get all weights from entries
        const weights = workout.entries.map((entry: any) => entry.weight);

        // Return max weight
        return Math.max(...weights);
    };

    const handleChangeDay = () => {
        if (workoutStarted) {
            setModalMessage(
                "You cannot change your workout day while a workout is active."
            );
            setmodalConfirmationTitle("Whoa there, gamer!");
            setShowConfirmationModal(true);
            return;
        }
        setSelectedDay(null);
        setWorkouts([]);
    };

    const navigateToWorkoutShop = () => {
        navigation.navigate("Workout Shop");
    };

    return (
        <View style={styles.container}>
            {!selectedDay ? (
                <View>
                    <PickWorkoutDay
                        days={workoutDays}
                        onSelect={setSelectedDay}
                    />

                    <PixelButton
                        text="Change Workout Split"
                        color="#0f0"
                        onPress={() => setShowSplitModal(true)}
                        containerStyle={{
                            marginVertical: 16,
                            borderColor: "#0f0",
                        }}
                    />

                    <WorkoutSplitModal
                        visible={showSplitModal}
                        onCancel={() => setShowSplitModal(false)}
                        splitName={splitName}
                        setSplitName={setSplitName}
                        splitDays={splitDays}
                        addDay={addSplitDay}
                        removeDay={removeSplitDay}
                        updateDay={updateSplitDay}
                        onConfirm={handleSplitConfirm}
                    />

                    <ConfirmationPixelModal
                        visible={showConfirmationModal}
                        onConfirm={() => setShowConfirmationModal(false)}
                        onCancel={() => setShowConfirmationModal(false)}
                        title={modalConfirmationTitle}
                        message={modalMessage}
                    />
                </View>
            ) : (
                <>
                    {!workouts || workouts.length === 0 ? (
                        <>
                            <PixelButton
                                text="Change Day"
                                onPress={handleChangeDay}
                                containerStyle={{ marginBottom: 10 }}
                            />
                            <PixelText
                                fontSize={20}
                                color="#ff0"
                                style={{
                                    marginBottom: 12,
                                    textAlign: "center",
                                }}
                            >
                                {selectedDay} Day
                            </PixelText>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <PixelText>No workouts found!</PixelText>
                                <PixelButton
                                    color="#ff0"
                                    text="Get Workouts"
                                    onPress={navigateToWorkoutShop}
                                    containerStyle={{
                                        marginTop: 15,
                                        borderColor: "#ff0",
                                    }}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <PixelButton
                                text="Change Day"
                                onPress={handleChangeDay}
                                containerStyle={{ marginBottom: 10 }}
                            />
                            <PixelText
                                fontSize={20}
                                color="#ff0"
                                style={{
                                    marginBottom: 12,
                                    textAlign: "center",
                                }}
                            >
                                {selectedDay} Day
                            </PixelText>
                            <PixelText
                                fontSize={18}
                                color="#0ff"
                                style={{
                                    marginBottom: 12,
                                    textAlign: "center",
                                }}
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
                                keyExtractor={(item) =>
                                    item.workoutId.toString()
                                }
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
                                                }}
                                            >
                                                Reps: 10, Failure, Failure
                                            </PixelText>
                                            <PixelText
                                                fontSize={10}
                                                color="#fff"
                                                style={{
                                                    marginBottom: 8,
                                                    textAlign: "left",
                                                }}
                                            >
                                                {`Max weight: ${getLastWorkoutWeight(
                                                    item.workoutId
                                                )} lbs`}
                                            </PixelText>

                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    gap: 8,
                                                }}
                                            >
                                                {(
                                                    weightEntries[
                                                        item.workoutId
                                                    ] || []
                                                ).map((weight, i) => (
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
                                                        style={
                                                            styles.weightInput
                                                        }
                                                        placeholder="0"
                                                        placeholderTextColor="#555"
                                                    />
                                                ))}
                                            </View>
                                        </View>

                                        <View style={styles.buttonsColumn}>
                                            <PixelButton
                                                text="+"
                                                onPress={() =>
                                                    addEntry(item.workoutId)
                                                }
                                                containerStyle={{
                                                    marginBottom: 8,
                                                    width: 40,
                                                }}
                                            />
                                            <PixelButton
                                                text="-"
                                                onPress={() =>
                                                    deleteEntry(item.workoutId)
                                                }
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
                            <ConfirmationPixelModal
                                visible={showConfirmationModal}
                                onConfirm={() =>
                                    setShowConfirmationModal(false)
                                }
                                onCancel={() => setShowConfirmationModal(false)}
                                title={modalConfirmationTitle}
                                message={modalMessage}
                            />
                        </>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: 20,
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
