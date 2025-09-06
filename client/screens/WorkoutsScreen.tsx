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
import * as SQLite from "expo-sqlite";
import {
    UserWorkout,
    Workout,
    WorkoutDay,
    UserWorkoutWithName,
} from "../types/db";

type WeightEntries = Record<number, string[]>;

export default function WorkoutsScreen({ navigation }: any) {
    const [workouts, setWorkouts] = useState<UserWorkoutWithName[]>([]);
    const [weightEntries, setWeightEntries] = useState<WeightEntries>({});
    const [timer, setTimer] = useState<number>(0);
    const [workoutStarted, setWorkoutStarted] = useState<boolean>(false);
    const [workoutFinished, setWorkoutFinished] = useState<boolean>(false);
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
    const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
    const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitName, setSplitName] = useState("");
    const [splitDays, setSplitDays] = useState<string[]>(["", "", ""]);
    const [showConfetti, setShowConfetti] = useState(false);

    const [isPixelModalVisible, setPixelModalVisible] = useState(false);
    const [modalSplitMessage, setModalSplitMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const minWorkoutTime = 900; //15 minutes
    const [weightSystem, setWeightSystem] = useState<string>();
    const [repEntries, setRepEntries] = useState<{
        [workoutId: number]: string[];
    }>({});

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
            return;
        }

        const cleanedDays = splitDays.map((day) => day.trim().toUpperCase());

        try {
            const userIdStr = await SecureStore.getItemAsync("userId");
            const userId = Number(userIdStr);

            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            // 1. Delete existing days for this split
            await db.runAsync("DELETE FROM workout_days WHERE split_id = ?", [
                1,
            ]);

            // 2. Insert new days
            for (let i = 0; i < cleanedDays.length; i++) {
                await db.runAsync(
                    "INSERT INTO workout_days (day_index, day_name, split_id) VALUES (?, ?, ?)",
                    [i + 1, cleanedDays[i], 1]
                );
            }

            console.log("✅ Workout days updated:", cleanedDays);

            // Re-fetch data for UI
            fetchUserData();
            fetchUserWorkouts();
            setShowSplitModal(false);
            setSplitName("");
            setSplitDays(["", "", ""]);
        } catch (error) {
            console.error("❌ Failed to update workout days:", error);
        }
    };

    const openStartModal = () => {
        setModalAction("start");

        setmodalConfirmationTitle("Alright, gamer!");
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
            setmodalConfirmationTitle("Alright, gamer!");
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

    const updateRepsAndSet = async (
        userId: number,
        workoutId: number,
        reps: string[],
        weightsLifted: string[]
    ) => {
        const sets = reps.length;

        await authFetch(`/workouts/updateRepsAndSets/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({
                workoutId,
                sets,
                reps,
                weightsLifted,
            }),
        });
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
                    const workoutId = workout.workoutId;
                    const reps = repEntries[workoutId] || [];
                    const weights = weightEntries[workoutId] || [];

                    if (!entries || entries.length === 0) continue;
                    await updateRepsAndSet(userId, workoutId, reps, weights);

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
                setWorkoutFinished(true);
                setmodalConfirmationTitle("Nice work, gamer!");
                setModalMessage(
                    `Workout complete! You just gained ${workoutProgressData.xpGiven} XP!`
                );
                setShowConfirmationModal(true);
                resetWeightEntries();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 4800);
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

            // const userData = await authFetch(`/user/${userId}`);
            const db = await SQLite.openDatabaseAsync("gymgamer.db");
            const workouts: Workout[] = await db.getAllAsync(
                "SELECT * FROM workouts"
            );

            const workoutDays: WorkoutDay[] = await db.getAllAsync(
                "SELECT * FROM workout_days ORDER BY day_index ASC"
            );
            setWorkoutDays(workoutDays);

            const weightSystem = await SecureStore.getItemAsync("weightSystem");
            if (weightSystem === "METRIC" || weightSystem === "IMPERIAL") {
                setWeightSystem(weightSystem);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchUserWorkouts = useCallback(async () => {
        try {
            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            // 1. Get user ID
            const userIdStr = await SecureStore.getItemAsync("userId");
            if (!userIdStr) return [];
            const userId = Number(userIdStr);

            // 2. Get selected day ID (you should have a state for selectedDay)
            if (!selectedDay?.id) return [];
            const dayId = selectedDay.id;

            // 3. Query user_workouts joined with workouts
            const userWorkouts: UserWorkoutWithName[] = await db.getAllAsync(
                `
            SELECT uw.*, w.name, w.architype
            FROM user_workouts uw
            JOIN workouts w ON uw.workout_id = w.id
            WHERE uw.user_id = ? AND uw.day_id = ?
            ORDER BY uw.order_index ASC
            `,
                [userId, dayId]
            );

            // // 4. Initialize weight entries for UI
            // setWeightEntries((prev) => {
            //     const copy = { ...prev };
            //     userWorkouts.forEach((uw) => {
            //         if (!copy[uw.workout_id]) {
            //             copy[uw.workout_id] = uw.weights_lifted
            //                 ? JSON.parse(uw.weights_lifted).map(String)
            //                 : ["", "", ""]; // default 3 entries
            //         }
            //     });
            //     return copy;
            // });

            setWorkouts(userWorkouts);
            console.log("Fetched workouts:", userWorkouts);

            return userWorkouts;
        } catch (err) {
            console.error("Failed to fetch local user workouts:", err);
            return [];
        }
    }, [selectedDay]);

    const resetUserRepEntries = () => {
        setRepEntries(() => {
            (allWorkoutEntries || []).forEach((w: Workout) => {
                const reps =
                    w.reps && w.reps.length > 0
                        ? w.reps
                        : new Array(w.sets ?? 3).fill("");

                repEntries[w.workoutId] = reps;
            });

            return repEntries;
        });
    };

    // Fetch workouts on mount
    useEffect(() => {
        const initializeWorkoutData = async () => {
            fetchUserData();
            const allWorkouts = await fetchUserWorkouts();

            const savedTime = await AsyncStorage.getItem("workoutStartTime");
            if (savedTime) {
                setWorkoutStarted(true);
                setWorkoutStartTime(Number(savedTime));
            }

            //console.log(allWorkoutEntries)
            // Now that workouts are fetched and allWorkoutEntries is set
            setRepEntries(() => {
                const newEntries: Record<string, string[]> = {};
                (allWorkouts || []).forEach((w: Workout) => {
                    const reps =
                        w.reps && w.reps.length > 0
                            ? w.reps
                            : new Array(w.sets ?? 3).fill("");
                    newEntries[w.workoutId] = reps;
                });

                return newEntries;
            });
            console.log("Initialized workout data...");
        };

        initializeWorkoutData();
    }, [fetchUserWorkouts, fetchUserData]);

    useFocusEffect(
        useCallback(() => {
            if (selectedDay) {
                console.log("Fetched lastest workouts");
                fetchUserWorkouts();
                setWorkoutFinished(false);
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
        if (!workoutStarted) {
            playBadMoveSound();
            setModalMessage("Please start a workout to enter in a weight.");
            setmodalConfirmationTitle("Whoa there, gamer!");
            setShowConfirmationModal(true);
        }
        setWeightEntries((prev) => {
            const copy = { ...prev };
            const weights = copy[workoutId] ? [...copy[workoutId]] : [];
            weights[index] = value;
            copy[workoutId] = weights;
            return copy;
        });
    };

    const handleRepChange = (
        workoutId: number,
        index: number,
        value: string
    ) => {
        if (!workoutStarted) {
            playBadMoveSound();
            setModalMessage("Please start a workout to enter in reps.");
            setmodalConfirmationTitle("Whoa there, gamer!");
            setShowConfirmationModal(true);
        }
        setRepEntries((prev) => {
            const copy = { ...prev };

            // Initialize if not present
            if (!copy[workoutId]) {
                copy[workoutId] = [];
            }

            // Update the specific rep entry
            const newReps = [...copy[workoutId]];
            newReps[index] = value;
            copy[workoutId] = newReps;

            return copy;
        });
    };

    // Add one more weight entry box
    const addEntry = (workoutId: number): void => {
        const MAX_ENTRIES = 7;

        // Rebuild reps first
        resetUserRepEntries();

        // Rebuild weights to match new rep count
        setWeightEntries((prev) => {
            const updated = { ...prev };
            const currentWeights = updated[workoutId] ?? [];

            if (currentWeights.length >= MAX_ENTRIES) {
                console.log("❌ Cannot add more than 7 weight entries");
                playBadMoveSound?.();
                return prev;
            }

            // Add blank weight to match reps
            updated[workoutId] = [...currentWeights, ""];
            return updated;
        });
    };

    // Remove last weight entry box
    const deleteEntry = (workoutId: number): void => {
        setWeightEntries((prevWeights) => {
            const weightsCopy = { ...prevWeights };
            if (weightsCopy[workoutId] && weightsCopy[workoutId].length > 1) {
                weightsCopy[workoutId] = weightsCopy[workoutId].slice(0, -1);
            } else {
                playBadMoveSound();
                console.log("Cannot delete last weight entry");
            }
            return weightsCopy;
        });

        setRepEntries((prevReps) => {
            const repsCopy = { ...prevReps };
            const savedLength =
                allWorkoutEntries.find((w) => w.workoutId === workoutId)?.reps
                    .length ?? 0;

            if (
                repsCopy[workoutId] &&
                repsCopy[workoutId].length > savedLength
            ) {
                // Only delete if there are extra (unsaved) reps
                repsCopy[workoutId] = repsCopy[workoutId].slice(0, -1);
            } else {
                // Don't delete saved rep
            }

            return repsCopy;
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
            playBadMoveSound();
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
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
                                    onConfirm={() => {
                                        setShowConfirmationModal(false);
                                    }}
                                    onCancel={() => {
                                        setShowConfirmationModal(false);
                                    }}
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
                                            {selectedDay?.day_name} Day
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
                                            setSelectedDay={setSelectedDay}
                                            finishedWorkout={workoutFinished}
                                            setWorkoutFinished={
                                                setWorkoutFinished
                                            }
                                            navigation={navigation}
                                        />

                                        {isLoading && (
                                            <ActivityIndicator
                                                size="large"
                                                color="#0ff"
                                                style={{ marginTop: 20 }}
                                            />
                                        )}

                                        <GestureHandlerRootView
                                            style={{ flex: 1 }}
                                        >
                                            <DraggableFlatList
                                                data={workouts}
                                                onDragEnd={({ data }) => {
                                                    setWorkouts(data);
                                                    //saveWorkoutOrder(data);
                                                }}
                                                keyExtractor={(item) =>
                                                    item.workout_id.toString()
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
                                                        handleRepChange={
                                                            handleRepChange
                                                        }
                                                        repEntries={repEntries}
                                                        defaultWeights={
                                                            allWorkoutEntries
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
        width: 85,
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
