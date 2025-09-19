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
import { playCompleteSound } from "../utils/playCompleteSound";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import WorkoutHeader from "../components/WorkoutHeader";
import WorkoutItem from "../components/WorkoutItem";
import { getDb } from "../db/db";
import { UserWorkout, WorkoutDay, UserWorkoutWithName } from "../types/db";
import { addXpAndCheckLevelUp } from "../utils/addXPAndCheckLevelUp";
import { checkAndProgressAchievements } from "../utils/checkAndProgressAchievements";
import { notifyAchievements } from "../utils/notifyAchievement";
import { convertKgToLbs } from "../utils/conversions";
import { roundToNearestHalf } from "../utils/unitUtils";

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
    const [allWorkoutEntries, setAllWorkoutEntries] = useState<
        UserWorkoutWithName[]
    >([]);
    const [maxWeightEntries, setMaxWeightEntries] = useState<
        Record<number, number>
    >({});
    [];
    const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
    const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitName, setSplitName] = useState("");
    const [splitDays, setSplitDays] = useState<string[]>(["", "", ""]);
    const [showConfetti, setShowConfetti] = useState(false);

    const [isPixelModalVisible, setPixelModalVisible] = useState(false);
    const [modalSplitMessage, setModalSplitMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const minWorkoutTime = 900; //900 15 minutes
    const [weightSystem, setWeightSystem] = useState<string>();
    const [repEntries, setRepEntries] = useState<{
        [workout_id: number]: string[];
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

            const db = await getDb();

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
        const resetWeights: Record<number, string[]> = {};
        const resetReps: Record<number, string[]> = {};

        workouts.forEach((w) => {
            const len = weightEntries[w.workout_id]?.length || w.sets || 3;
            resetWeights[w.workout_id] = new Array(len).fill("");
            resetReps[w.workout_id] = new Array(len).fill("");
        });

        setWeightEntries(resetWeights);
        setRepEntries(resetReps);
    };

    const updateRepsAndSet = async (
        userId: number,
        workout_id: number,
        reps: string[],
        weightsLifted: string[]
    ) => {
        const sets = reps.length;

        await authFetch(`/workouts/updateRepsAndSets/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({
                workout_id,
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
                    playBadMoveSound();
                    setWorkoutStarted(false);
                    setWorkoutStartTime(null);
                    setTimer(0);
                    await AsyncStorage.removeItem("workoutStartTime");
                    resetWeightEntries();
                    return;
                }

                setIsLoading(true);

                const userIdStr = await SecureStore.getItemAsync("userId");
                if (!userIdStr) return;
                const userId = Number(userIdStr);
                if (isNaN(userId)) return;

                if (!selectedDay) {
                    console.error("No day selected, cannot complete workout");
                    setIsLoading(false);
                    return;
                }

                const db = await getDb();

                let totalWeightLifted = 0;
                let newCompletedAchievements: any[] = [];

                // Save reps/weights for each workout
                for (const workout of workouts) {
                    const workout_id = workout.workout_id;
                    const reps = repEntries[workout_id] || [];
                    const weights = weightEntries[workout_id] || [];
                    const entries = weightEntries[workout_id] || [];

                    if (entries.length === 0) continue;
                    if (weights.length === 0) continue;

                    // Update reps + weights in user_workouts
                    await db.runAsync(
                        `UPDATE user_workouts
                     SET reps = ?, weights_lifted = ?
                     WHERE workout_id = ? AND day_id = ?`,
                        [
                            JSON.stringify(reps),
                            JSON.stringify(weights),
                            workout_id,
                            selectedDay?.id,
                        ]
                    );

                    // Total lifted
                    const sumWeights = weights.reduce((sum, w) => {
                        const num = Number(w);
                        return sum + (isNaN(num) ? 0 : num);
                    }, 0);
                    totalWeightLifted += sumWeights;

                    const maxWeight = Math.max(...entries.map(Number));

                    if (maxWeight > 0) {
                        let finalWeight = maxWeight;

                        // 🔥 convert to lbs if user is in metric
                        if (weightSystem === "METRIC") {
                            finalWeight = maxWeight * 2.20462;
                        }

                        await db.runAsync(
                            `INSERT INTO workout_entries (workout_id, weight, date) 
                            VALUES (?, ?, ?)`,
                            [workout_id, finalWeight, new Date().toISOString()]
                        );

                        const previousMax: any = await db.getFirstAsync(
                            `SELECT MAX(weight) as max_weight FROM workout_entries WHERE workout_id = ?`,
                            [workout.workout_id]
                        );

                        // LiftingWeight achievement
                        const liftingWeightAchievements =
                            await checkAndProgressAchievements(
                                ["LIFTINGWEIGHT"],
                                {
                                    sets: weightEntries[workout_id],
                                    weight: finalWeight,
                                    weightSystem: weightSystem,
                                    workoutName: workout.name,
                                    previousMax: previousMax.max_weight,
                                }
                            );
                        if (liftingWeightAchievements.length) {
                            newCompletedAchievements.push(
                                ...liftingWeightAchievements
                            );
                        }
                    }
                }

                // Check for achievements
                const completedWorkoutProgressXP = 150;
                const levelUpResult = await addXpAndCheckLevelUp(
                    completedWorkoutProgressXP
                );
                console.log(levelUpResult.newlyCompletedAchievements);

                if (levelUpResult.newlyCompletedAchievements?.length) {
                    newCompletedAchievements.push(
                        ...levelUpResult.newlyCompletedAchievements
                    );
                }

                let weightLifted: number;
                if (weightSystem === "METRIC") {
                    weightLifted = convertKgToLbs(totalWeightLifted);
                    // Round to nearest 0.5 lbs
                    weightLifted = roundToNearestHalf(totalWeightLifted);
                } else {
                    weightLifted = totalWeightLifted;
                }

                const now = new Date();
                const workoutEndTime = now.toISOString();
                const localHour = now.getHours();

                const workoutAndStreakAchievments =
                    await checkAndProgressAchievements(["WORKOUT", "STREAK"], {
                        duration: timer,
                        workoutEndTime: workoutEndTime,
                        localHour,
                    });

                if (workoutAndStreakAchievments?.length) {
                    newCompletedAchievements.push(
                        ...workoutAndStreakAchievments
                    );
                }

                if (newCompletedAchievements.length > 0) {
                    await notifyAchievements(newCompletedAchievements);
                    newCompletedAchievements.forEach((ach) =>
                        console.log(`🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`)
                    );
                }

                // Update total + weekly lifted weight
                await db.runAsync(
                    `
                     UPDATE users
                     SET total_weight_lifted = total_weight_lifted + ?,
                         weekly_weight_lifted = weekly_weight_lifted + ?
                     WHERE id = 1;
                     `,
                    [weightLifted, weightLifted]
                );

                playCompleteSound();
                setWorkoutStarted(false);
                setWorkoutStartTime(null);
                setTimer(0);
                setIsLoading(false);
                await AsyncStorage.removeItem("workoutStartTime");
                setWorkoutFinished(true);
                setmodalConfirmationTitle("Nice work, gamer!");
                // setModalMessage(
                //     `Workout complete! You just gained ${workoutProgressData.xpGiven} XP!`
                // );
                setModalMessage(
                    `Workout complete! You just gained ${completedWorkoutProgressXP} XP!`
                );
                setShowConfirmationModal(true);
                resetWeightEntries();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 4800);
            } catch (error) {
                setIsLoading(false);
                console.error("❌ Complete workout failed", error);
                playBadMoveSound();
            }
        }

        setModalAction(null);
    };

    const loadMaxWeights = async () => {
        const db = await getDb();

        const rows: { workout_id: number; maxWeight: number }[] =
            await db.getAllAsync(`
                        SELECT workout_id, MAX(weight) as maxWeight
                        FROM workout_entries
                        GROUP BY workout_id
                    `);
        const map: Record<number, number> = {};
        rows.forEach((r) => {
            map[r.workout_id] = r.maxWeight;
        });
        setMaxWeightEntries(map);
    };

    const fetchUserData = useCallback(async () => {
        try {
            const userIdStr = await SecureStore.getItemAsync("userId");
            if (!userIdStr) return;
            const userId = Number(userIdStr);

            // const userData = await authFetch(`/user/${userId}`);
            const db = await getDb();

            const workoutDays: WorkoutDay[] = await db.getAllAsync(
                "SELECT * FROM workout_days ORDER BY day_index ASC"
            );
            setWorkoutDays(workoutDays);

            loadMaxWeights();

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
            const db = await getDb();

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
            WHERE uw.day_id = ?
            ORDER BY uw.order_index ASC
            `,
                [dayId]
            );

            // // 4. Initialize weight entries for UI
            setWeightEntries((prev) => {
                const copy = { ...prev };
                userWorkouts.forEach((uw) => {
                    if (!copy[uw.workout_id]) {
                        copy[uw.workout_id] = uw.weights_lifted
                            ? JSON.parse(uw.weights_lifted).map(String)
                            : ["", "", ""]; // default 3 entries
                    }
                });
                return copy;
            });

            setRepEntries((prev) => {
                const copy: Record<number, string[]> = { ...prev };
                userWorkouts.forEach((uw) => {
                    const repsStr = uw.reps as unknown as string | undefined;
                    copy[uw.workout_id] = repsStr
                        ? JSON.parse(repsStr).map(String)
                        : new Array(uw.sets ?? 3).fill("");
                });
                return copy;
            });

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
            const newRepEntries: Record<number, string[]> = {};

            (allWorkoutEntries || []).forEach((w: UserWorkout) => {
                const reps: string[] =
                    Array.isArray(w.reps) && w.reps.length > 0
                        ? w.reps
                        : new Array(w.sets ?? 3).fill("");

                newRepEntries[w.workout_id] = reps;
            });

            return newRepEntries;
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

            //console.log(allWorkoutEntries);
            // Now that workouts are fetched and allWorkoutEntries is set
            setRepEntries(() => {
                const newEntries: Record<string, string[]> = {};

                (allWorkouts || []).forEach((w: UserWorkout) => {
                    const reps: string[] =
                        Array.isArray(w.reps) && w.reps.length > 0
                            ? w.reps
                            : new Array(w.sets ?? 3).fill("");

                    newEntries[w.workout_id.toString()] = reps;
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
        workout_id: number,
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
            const weights = copy[workout_id] ? [...copy[workout_id]] : [];
            weights[index] = value;
            copy[workout_id] = weights;
            return copy;
        });
    };

    const handleRepChange = (
        workout_id: number,
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
            if (!copy[workout_id]) {
                copy[workout_id] = [];
            }

            // Update the specific rep entry
            const newReps = [...copy[workout_id]];
            newReps[index] = value;
            copy[workout_id] = newReps;

            return copy;
        });
    };

    // Add one more weight entry box
    const addEntry = async (workout_id: number): Promise<void> => {
        const MAX_ENTRIES = 7;

        // Get userId
        const userIdStr = await SecureStore.getItemAsync("userId");
        const userId = Number(userIdStr);
        if (!userId) return;

        resetUserRepEntries();

        setWeightEntries((prev) => {
            const updated = { ...prev };
            const currentWeights = updated[workout_id] ?? [];

            if (currentWeights.length >= MAX_ENTRIES) {
                playBadMoveSound?.();
                console.log("❌ Cannot add more than 7 weight entries");
                return prev;
            }

            const newWeights = [...currentWeights, ""];
            updated[workout_id] = newWeights;

            // Also update reps in sync
            setRepEntries((repPrev) => {
                const repUpdated = { ...repPrev };
                const currentReps = repUpdated[workout_id] ?? [];
                repUpdated[workout_id] = [...currentReps, ""];
                // Persist both to DB
                saveWorkoutEntries(
                    userId,
                    workout_id,
                    repUpdated[workout_id],
                    newWeights
                );
                return repUpdated;
            });

            return updated;
        });
    };

    // Remove last weight entry box
    const deleteEntry = async (workout_id: number): Promise<void> => {
        const userIdStr = await SecureStore.getItemAsync("userId");
        const userId = Number(userIdStr);
        if (!userId) return;

        setWeightEntries((prevWeights) => {
            const weightsCopy = { ...prevWeights };
            let newWeights = weightsCopy[workout_id] ?? [];

            if (newWeights.length > 1) {
                newWeights = newWeights.slice(0, -1);
                weightsCopy[workout_id] = newWeights;
            } else {
                playBadMoveSound();
                console.log("Cannot delete last weight entry");
            }

            // Reps must also shrink
            setRepEntries((prevReps) => {
                const repsCopy = { ...prevReps };
                let newReps = repsCopy[workout_id] ?? [];

                if (newReps.length > 1) {
                    newReps = newReps.slice(0, -1);
                    repsCopy[workout_id] = newReps;
                }

                // Persist to DB
                saveWorkoutEntries(userId, workout_id, newReps, newWeights);

                return repsCopy;
            });

            return weightsCopy;
        });
    };

    // Get the max weight for a given workout_id
    const getLastWorkoutWeight = (workout_id: number): number => {
        return maxWeightEntries[workout_id] || 0;
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

    const saveWorkoutOrder = async (orderedWorkouts: UserWorkoutWithName[]) => {
        try {
            const userIdStr = await SecureStore.getItemAsync("userId");
            const userId = Number(userIdStr);
            if (!userId || !selectedDay) return;

            const db = await getDb();

            // Update each workout’s order_index in user_workouts
            for (let i = 0; i < orderedWorkouts.length; i++) {
                const w = orderedWorkouts[i];
                await db.runAsync(
                    `UPDATE user_workouts 
                    SET order_index = ? 
                    WHERE workout_id = ? AND day_id = ?`,
                    [i, w.workout_id, selectedDay.id]
                );
            }

            console.log("✅ Workout order updated in SQLite:", orderedWorkouts);
        } catch (err) {
            console.error("❌ Failed to update workout order:", err);
        }
    };

    const saveWorkoutEntries = async (
        userId: number,
        workout_id: number,
        reps: string[],
        weights: string[]
    ) => {
        try {
            const db = await getDb();

            // Ensure reps and weights are clean arrays of strings
            const cleanReps = Array.isArray(reps)
                ? reps
                      .map((r) => String(r).trim())
                      .filter((r) => r !== "" && r !== "Reps")
                : [];

            const cleanWeights = Array.isArray(weights)
                ? weights.map((w) => String(w).trim()).filter((w) => w !== "")
                : [];

            await db.runAsync(
                `
            UPDATE user_workouts
            SET sets = ?, reps = ?, weights_lifted = ?
            WHERE workout_id = ? AND day_id = ?
            `,
                [
                    cleanReps.length,
                    JSON.stringify(cleanReps),
                    JSON.stringify(cleanWeights),
                    workout_id,
                    selectedDay?.id!,
                ]
            );

            console.log(`✅ Saved entries for workout ${workout_id}`);
        } catch (err) {
            console.error("❌ Failed to save entries:", err);
        }
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
                                                    saveWorkoutOrder(data);
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
                                                            workouts
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
        width: Platform.OS === "ios" ? 40 : 55,
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
});
