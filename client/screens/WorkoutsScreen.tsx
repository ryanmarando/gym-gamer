import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Image,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import WorkoutSplitModal from "../components/WorkoutSplitModal";
import Celebration from "../components/Celebration";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import PickWorkoutDay from "../components/PickWorkoutDay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendPushNotification } from "../utils/notification";
import { playCompleteSound } from "../utils/playCompleteSound";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { playBadMoveSound } from "../utils/playBadMoveSound";

import WorkoutHeader from "../components/WorkoutHeader";
import WorkoutItem from "../components/WorkoutItem";

interface Workout {
    userId: number;
    workoutId: number;
    workout: {
        id: number;
        name: string;
    };
    entries: any[]; // Adjust as you expand entries shape
}

type WeightEntries = Record<number, string[]>; // workoutId -> array of weights

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
    const [workoutDays, setWorkoutDays] = useState<
        { id: number; name: string }[]
    >([]);
    const [selectedDay, setSelectedDay] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitName, setSplitName] = useState("");
    const [splitDays, setSplitDays] = useState<string[]>(["", "", ""]);
    const [showConfetti, setShowConfetti] = useState(false);

    const [isPixelModalVisible, setPixelModalVisible] = useState(false);
    const [modalSplitMessage, setModalSplitMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const minWorkoutTime = 1; //15 minutes
    const [weightSystem, setWeightSystem] = useState<string>();

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
            playBadMoveSound();

            setModalSplitMessage("Please fill in all day names.");
            setPixelModalVisible(true);
            //alert("Please fill in all day names.");
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
        if (timer < minWorkoutTime) {
            setModalMessage(
                "Are you sure you want to complete the workout? Workouts under 15 minutes will not save."
            );
        } else {
            setModalMessage("Are you sure you want to complete the workout?");
        }
        setShowModal(true);
    };

    const resetWeightEntries = () => {
        const reset: any = {};
        for (const workoutId in weightEntries) {
            // Reset to same length but with 0s
            reset[workoutId] = new Array(weightEntries[workoutId].length).fill(
                ""
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
                if (timer < minWorkoutTime) {
                    // User is confirming too-short workout now
                    playBadMoveSound();
                    setWorkoutStarted(false);
                    setWorkoutStartTime(null);
                    setTimer(0);
                    await AsyncStorage.removeItem("workoutStartTime");
                    resetWeightEntries();

                    setmodalConfirmationTitle("Got it!");
                    setModalMessage("Workout ended without saving progress.");
                    setShowConfirmationModal(true);
                    return;
                }
                setIsLoading(true);
                const userIdStr = await SecureStore.getItemAsync("userId");
                if (!userIdStr) return;
                const userId = Number(userIdStr);
                if (isNaN(userId)) return;

                let totalWeightLifted = 0;

                // Save last weight entry for each workout
                for (const workout of workouts) {
                    const entries = weightEntries[workout.workoutId];
                    if (!entries || entries.length === 0) continue;

                    // Sum all weights for this workout (all sets)
                    const sumWeights = entries.reduce((sum, w) => {
                        const num = Number(w);
                        return sum + (isNaN(num) ? 0 : num);
                    }, 0);

                    totalWeightLifted += sumWeights;

                    const maxWeight = Math.max(...entries.map(Number));

                    let newCompletedAchievements: any[] = [];

                    // Only send if lastWeight > 0 (optional)
                    if (maxWeight > 0) {
                        const result = await authFetch(
                            `/workouts/addWorkoutEntry?userId=${userId}&workoutId=${workout.workoutId}`,
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    weight: maxWeight,
                                }),
                            }
                        );

                        if (result.newlyCompletedAchievements?.length) {
                            newCompletedAchievements.push(
                                ...result.newlyCompletedAchievements
                            );
                        }

                        // Now send totalWeightLifted to backend for weekly tracking
                        if (totalWeightLifted > 0) {
                            const weightLiftedResult = await authFetch(
                                `/workouts/addUserWeightLifted/${userId}`,
                                {
                                    method: "PATCH",
                                    body: JSON.stringify({
                                        weightLifted: Number(totalWeightLifted),
                                        workoutName: workout.workout.name,
                                    }),
                                }
                            );

                            if (
                                weightLiftedResult.newlyCompletedAchievements
                                    ?.length
                            ) {
                                newCompletedAchievements.push(
                                    ...weightLiftedResult.newlyCompletedAchievements
                                );
                            }
                        }

                        if (newCompletedAchievements.length) {
                            // Send notification
                            sendNotification(newCompletedAchievements);

                            newCompletedAchievements.forEach((ach: any) => {
                                console.log(
                                    `🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`
                                );
                                // Show modal, play sound, push notification, etc.
                            });
                        }
                    }
                }

                // Now call complete workout endpoint
                const now = new Date();
                const workoutEndTime = now.toISOString();
                const localHour = now.getHours();
                const workoutProgressData = await authFetch(
                    `/workouts/completeWorkout/${userId}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            duration: timer,
                            workoutEndTime: workoutEndTime,
                            localHour,
                        }),
                    }
                );

                if (workoutProgressData.newlyCompletedAchievements?.length) {
                    // Send notification
                    sendNotification(
                        workoutProgressData.newlyCompletedAchievements
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
                playCompleteSound();
                setWorkoutStarted(false);
                setWorkoutStartTime(null);
                setTimer(0);
                setIsLoading(false);
                await AsyncStorage.removeItem("workoutStartTime");
                setSelectedDay(null);
                setmodalConfirmationTitle("Nice work, gamer!");
                setModalMessage(
                    `Workout complete! You just gained ${workoutProgressData.xpGiven} XP!`
                );
                setShowConfirmationModal(true);
                resetWeightEntries();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            } catch (error) {
                setIsLoading(false);
                console.error("Complete workout failed", error);
                playBadMoveSound();
                setmodalConfirmationTitle("Whoa there, gamer!");
                setModalMessage(`Complete workout failed: ${error}`);
                setShowConfirmationModal(true);
            }
        }

        setModalAction(null);
    };

    const sendNotification = async (newCompletedAchievements: any[]) => {
        const expoPushToken = await SecureStore.getItemAsync("notifToken");
        console.log("Push token:", expoPushToken);
        if (!expoPushToken) {
            return;
        }

        const title = "Hey, Gym Gamer!";
        let body: string;

        if (newCompletedAchievements.length === 1) {
            const achievementName = newCompletedAchievements[0].name;
            body = `🏆 You completed '${achievementName}'!`;
        } else {
            body = `🏆 You completed ${newCompletedAchievements.length} achievements!`;
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
                    .map((d: any) => ({
                        id: d.id,
                        name: d.dayName,
                    }));

                setWorkoutDays(days);
            }
            const weightSystem = await SecureStore.getItemAsync("weightSystem");
            if (weightSystem === "METRIC" || weightSystem === "IMPERIAL") {
                setWeightSystem(weightSystem);
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
                `/user/getUserWorkoutsByArchitype/${userIdStr}/${selectedDay.name}`
            );

            //console.log(data.message === "No architype found.");

            if (data.message === "No architype found.") {
                const userWorkouts = await authFetch(
                    `/user/getUserWorkouts/${userIdStr}`
                );

                const filtered = userWorkouts.workouts.filter(
                    (w: any) => w.dayId === selectedDay?.id
                );

                const ordered = filtered.sort(
                    (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
                );
                setWorkouts(ordered);

                setAllWorkoutEntries(filtered);

                // Reset weight entries too
                setWeightEntries((prev) => {
                    const copy = { ...prev };
                    filtered.forEach((w: Workout) => {
                        if (!copy[w.workoutId]) {
                            copy[w.workoutId] = ["", "", ""];
                        }
                    });
                    return copy;
                });

                return;
            }

            const ordered = data.workouts.sort(
                (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
            );
            setWorkouts(ordered);

            //setWorkouts(data.workouts || []);
            setAllWorkoutEntries(data.workouts);

            // ✅ Reset the weightEntries so each workout has 3 boxes
            setWeightEntries((prev) => {
                const copy = { ...prev };

                (data.workouts || []).forEach((w: Workout) => {
                    if (!copy[w.workoutId]) {
                        // Only initialize if missing
                        copy[w.workoutId] = ["", "", ""];
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
            weights[index] = value;
            copy[workoutId] = weights;
            return copy;
        });
    };

    // Add one more weight entry box
    const addEntry = (workoutId: number): void => {
        setWeightEntries((prev) => {
            const copy = { ...prev };
            const arr = copy[workoutId] ? [...copy[workoutId]] : [];

            if (arr.length >= 7) {
                playBadMoveSound();
                console.log("Cannot add more than 7 entries");
                return prev; // Do nothing, keep state unchanged
            }

            arr.push("");
            copy[workoutId] = arr;
            return copy;
        });
    };

    // Remove last weight entry box
    const deleteEntry = (workoutId: number): void => {
        setWeightEntries((prev) => {
            const copy = { ...prev };
            if (copy[workoutId] && copy[workoutId].length > 1) {
                copy[workoutId] = copy[workoutId].slice(0, -1);
            } else {
                playBadMoveSound();
                console.log("Cannot delete last entry");
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

    const saveWorkoutOrder = async (orderedWorkouts: Workout[]) => {
        const userIdStr = await SecureStore.getItemAsync("userId");
        const userId = Number(userIdStr);
        if (!userId || !selectedDay) return;

        // Prepare an array of { workoutId, order }
        const orderedData = orderedWorkouts.map((w, index) => ({
            workoutId: w.workoutId,
            order: index,
            dayId: selectedDay.id,
        }));

        console.log("Saving order:", orderedData);

        await authFetch(`/workouts/saveWorkoutOrder/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({ workouts: orderedData }),
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
                keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
            >
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}
                    accessible={false}
                >
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

                                <View
                                    style={{
                                        alignItems: "center",
                                        marginTop: 40,
                                        bottom: 0,
                                    }}
                                >
                                    <Image
                                        source={require("../assets/HeadphonePixel.png")}
                                        style={{
                                            width: 180,
                                            height: 180,
                                        }}
                                    />
                                    <PixelText color="#9B59B6">
                                        Get the tunes ready!
                                    </PixelText>
                                </View>

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
                                    isPixelModalVisible={isPixelModalVisible}
                                    setPixelModalVisible={setPixelModalVisible}
                                    modalSplitMessage={modalSplitMessage}
                                    setModalSplitMessage={setModalSplitMessage}
                                />

                                <ConfirmationPixelModal
                                    visible={showConfirmationModal}
                                    onConfirm={() =>
                                        setShowConfirmationModal(false)
                                    }
                                    onCancel={() =>
                                        setShowConfirmationModal(false)
                                    }
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
                                            containerStyle={{
                                                marginBottom: 10,
                                            }}
                                        />
                                        <PixelText
                                            fontSize={20}
                                            color="#ff0"
                                            style={{
                                                marginBottom: 12,
                                                textAlign: "center",
                                            }}
                                        >
                                            {selectedDay?.name} Day
                                        </PixelText>
                                        <View
                                            style={{
                                                flex: 1,
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <PixelText>
                                                No workouts found!
                                            </PixelText>
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
                                        <WorkoutHeader
                                            selectedDay={selectedDay}
                                            timer={timer}
                                            workoutStarted={workoutStarted}
                                            formatTime={formatTime}
                                            handleChangeDay={handleChangeDay}
                                            openStartModal={openStartModal}
                                            openCompleteModal={
                                                openCompleteModal
                                            }
                                            showModal={showModal}
                                            onModalConfirm={onModalConfirm}
                                            modalAction={modalAction}
                                            modalMessage={modalMessage}
                                            setShowModal={setShowModal}
                                            showConfirmationModal={
                                                showConfirmationModal
                                            }
                                            setShowConfirmationModal={
                                                setShowConfirmationModal
                                            }
                                            modalConfirmationTitle={
                                                modalConfirmationTitle
                                            }
                                            showConfetti={showConfetti}
                                        />

                                        {isLoading && (
                                            <ActivityIndicator
                                                size="large"
                                                color="#0ff"
                                                style={{ marginTop: 20 }}
                                            />
                                        )}

                                        {showConfetti && <Celebration />}

                                        <GestureHandlerRootView
                                            style={{ flex: 1 }}
                                        >
                                            <DraggableFlatList
                                                data={workouts}
                                                onDragEnd={({ data }) => {
                                                    setWorkouts(data);
                                                    saveWorkoutOrder(data);
                                                }}
                                                keyExtractor={(item) =>
                                                    item.workoutId.toString()
                                                }
                                                renderItem={({
                                                    item,
                                                    drag,
                                                    isActive,
                                                }) => (
                                                    <WorkoutItem
                                                        item={item}
                                                        isActive={isActive}
                                                        drag={drag}
                                                        weightEntries={
                                                            weightEntries
                                                        }
                                                        handleWeightChange={
                                                            handleWeightChange
                                                        }
                                                        getLastWorkoutWeight={
                                                            getLastWorkoutWeight
                                                        }
                                                        addEntry={addEntry}
                                                        deleteEntry={
                                                            deleteEntry
                                                        }
                                                        weightSystem={
                                                            weightSystem!
                                                        }
                                                    />
                                                )}
                                            />
                                        </GestureHandlerRootView>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111",
    },
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: 20,
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
        height: Platform.OS === "ios" ? 40 : undefined,
        paddingHorizontal: 8,
        marginRight: 4,
        fontFamily: "PressStart2P_400Regular",
    },
    buttonsColumn: {
        marginLeft: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
});
