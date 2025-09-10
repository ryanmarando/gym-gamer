import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    SectionList,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import CustomWorkoutModal from "../components/CustomWorkoutModal";
import PixelModal from "../components/PixelModal";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import { sendPushNotification } from "../utils/notification";
import { SafeAreaView } from "react-native-safe-area-context";
import { playDeleteSound } from "../utils/playDeleteSound";
import { playSwordSelectionSound } from "../utils/playSwordSelectionSound";
import { playCompleteSound } from "../utils/playCompleteSound";
import * as SQLite from "expo-sqlite";
import { checkAndProgressAchievements } from "../utils/checkAndProgressAchievements";
import { notifyAchievements } from "../utils/notifyAchievement";

export default function SaveWorkoutScreen() {
    const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
    const [allWorkouts, setAllWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCustomWorkoutModal, setShowCustomWorkoutModal] =
        useState<boolean>(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "Are you sure?",
        message: "Removing this workout will delete all previous entries.",
        onConfirm: () => {},
    });
    const [pendingSaveWorkout, setPendingSaveWorkout] = useState<any>(null);
    const [splitSelectionModalVisible, setSplitSelectionModalVisible] =
        useState(false);
    const [splitOptions, setSplitOptions] = useState<
        { id: number; name: string }[]
    >([]);
    const [selectedSplitDay, setSelectedSplitDay] = useState<string | null>(
        null
    );
    const [selectedSplitDayId, setSelectedSplitDayId] = useState<number | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [modalConfirmationVisible, setModalConfirmationVisible] =
        useState(false);
    const [modalConfirmationConfig, setModalConfirmationConfig] = useState({
        title: "",
        message: "",
        onConfirm: () => {},
    });

    const workoutCategories = [
        { label: "💪 Push Workouts", architype: "PUSH" },
        { label: "🏋️ Pull Workouts", architype: "PULL" },
        { label: "🦵 Legs Workouts", architype: "LEGS" },
        { label: "🏋️‍♂️ Chest Workouts", architype: "CHEST" },
        { label: "🏹 Shoulders Workouts", architype: "SHOULDERS" },
        { label: "💪 Arms Workouts", architype: "ARMS" },
        { label: "🦍 Back Workouts", architype: "BACK" },
        { label: "🔥 Abs Workouts", architype: "ABS" },
        { label: "🦵 Quads Workouts", architype: "QUADS" },
        { label: "🏃 Hamstrings Workouts", architype: "HAMSTRINGS" },
        { label: "🍑 Glutes Workouts", architype: "GLUTES" },
        { label: "🐐 Calves Workouts", architype: "CALVES" },
    ];

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

    const fetchWorkouts = async () => {
        try {
            const db = await SQLite.openDatabaseAsync("gymgamer.db");
            const userIdStr = await SecureStore.getItemAsync("userId");
            const userId = Number(userIdStr);

            // All workouts
            const allWorkoutsRows: any[] = await db.getAllAsync(
                "SELECT * FROM workouts"
            );

            // Only user's saved workouts
            const userWorkoutsRows: any[] = await db.getAllAsync(
                `SELECT w.*
                        FROM user_workouts uw
                        JOIN workouts w ON uw.workout_id = w.id`
            );

            setAllWorkouts(allWorkoutsRows);
            setUserWorkouts(userWorkoutsRows);

            console.log("✅ Workouts loaded locally");
        } catch (err) {
            console.error("❌ Failed to load workouts locally:", err);
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
        Array.isArray(userWorkouts) &&
        userWorkouts.some((w) => w.id === workoutId);

    const filterWorkoutsByArchitype = (type: string) => {
        return allWorkouts.filter((w) => w.architype.includes(type));
    };

    const saveWorkoutToSplit = async (workoutId: number, day_id: number) => {
        try {
            const added = allWorkouts.find((w) => w.id === workoutId);
            if (added) setUserWorkouts((prev) => [...prev, added]);

            // Open local SQLite database
            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            // Insert into local table (create table beforehand if needed)
            await db.runAsync(
                `INSERT OR IGNORE INTO user_workouts (workout_id, day_id)
             VALUES (?, ?)`,
                [workoutId, day_id]
            );

            console.log("✅ Workout saved locally");

            playSwordSelectionSound();
            fetchWorkouts();
        } catch (error) {
            console.log(error);
        }
    };

    const toggleWorkout = async (workoutId: number) => {
        try {
            const userId = Number(await SecureStore.getItemAsync("userId"));
            const workout = allWorkouts.find((w) => w.id === workoutId);
            if (!workout) return;

            if (isSaved(workoutId)) {
                // Existing remove logic
                setModalConfig({
                    title: "Are you sure?",
                    message:
                        "This will remove the exercise from your catalog and delete your last reps and weights.",
                    onConfirm: () => confirmRemoveWorkout(workoutId),
                });
                setModalVisible(true);
            } else {
                // Open local SQLite database
                const db = await SQLite.openDatabaseAsync("gymgamer.db");

                let localUserData: any[] = await db.getAllAsync(
                    "SELECT * FROM workout_days"
                );
                console.log("SQlite", localUserData);

                // Get only the days array for this user
                const userSplits = localUserData;

                // Parse the JSON string into an array
                const workoutArchitypes: string[] = JSON.parse(
                    workout.architype
                );
                console.log(workoutArchitypes);

                // Find a matching day for the workout's architype
                const matchingDay = workoutArchitypes.find((type: string) =>
                    userSplits.some((day: any) => day.day_name === type)
                );

                // Create split options for the modal
                const splitOptions = userSplits.map((d: any) => ({
                    id: d.id,
                    name: d.day_name,
                }));

                setSplitOptions(splitOptions);
                setPendingSaveWorkout(workout);

                if (matchingDay) {
                    const matchedDay = userSplits.find(
                        (day: any) => day.day_name === matchingDay
                    );
                    if (matchedDay) {
                        setSelectedSplitDay(matchedDay.day_name);
                        setSelectedSplitDayId(matchedDay.id);
                    }
                } else {
                    setSelectedSplitDay(null);
                    setSelectedSplitDayId(null);
                }

                setSplitSelectionModalVisible(true);
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

    const confirmRemoveWorkout = async (workoutId: number) => {
        try {
            // Open local database
            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            // Delete the saved workout for this user
            await db.runAsync(
                `DELETE FROM user_workouts WHERE workout_id = ?`,
                [workoutId]
            );

            // Update local state
            setUserWorkouts((prev) => prev.filter((w) => w.id !== workoutId));

            fetchWorkouts();
            playDeleteSound();
            setUserWorkouts((prev) =>
                prev.filter((w) => w.workoutId !== workoutId)
            );
            fetchWorkouts();
        } catch (err) {
            console.error(err);
        } finally {
            setModalVisible(false);
        }
    };

    const deleteCustomWorkout = async (workoutId: number) => {
        try {
            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            // Delete from workouts table
            await db.runAsync("DELETE FROM workouts WHERE id = ?", [workoutId]);

            // Optionally, also delete any user_workouts referencing it
            await db.runAsync(
                "DELETE FROM user_workouts WHERE workout_id = ?",
                [workoutId]
            );

            console.log("Deleted workoutId:", workoutId);

            fetchWorkouts();
        } catch (err) {
            console.error("Failed to delete custom workout:", err);
        }
    };

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

            const db = await SQLite.openDatabaseAsync("gymgamer.db");

            // Insert new workout
            const architypeStr = JSON.stringify(data.architype);
            await db.runAsync(
                "INSERT INTO workouts (name, architype, created_by_user_id) VALUES (?, ?, ?)",
                [data.customName, architypeStr, 1]
            );

            // Optionally, get the inserted workout ID
            const insertedWorkouts: any[] = await db.getAllAsync(
                "SELECT * FROM workouts WHERE created_by_user_id = 1 ORDER BY id DESC LIMIT 1"
            );
            const newWorkout = insertedWorkouts[0];

            console.log("Workout created locally:", newWorkout);

            // 5️⃣ Check achievements locally
            const createdWorkoutAchievements =
                await checkAndProgressAchievements(["CREATION"], {
                    creationType: "createWorkout",
                });

            if (createdWorkoutAchievements?.length) {
                await notifyAchievements(createdWorkoutAchievements);
            }

            fetchWorkouts();
            playCompleteSound();
            setModalConfirmationConfig({
                title: "Nice work, gamer!",
                message: `${newWorkout.name} is now a new workout created just by you & for you!`,
                onConfirm: () => setModalConfirmationVisible(false),
            });
            setModalConfirmationVisible(true);
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
            <View style={{ flexDirection: "column", gap: 8 }}>
                <PixelButton
                    text={isSaved(item.id) ? "Remove" : "Save"}
                    color="#000"
                    onPress={() => toggleWorkout(item.id)}
                    style={[
                        styles.button,
                        { backgroundColor: isSaved(item.id) ? "#f55" : "#0f0" },
                    ]}
                >
                    <PixelText fontSize={12} color="#000">
                        {isSaved(item.id) ? "Remove" : "Save"}
                    </PixelText>
                </PixelButton>

                {item.created_by_user_id !== null && (
                    <PixelButton
                        text="Delete"
                        color="#000"
                        onPress={() => {
                            setModalConfig({
                                title: "Are you sure?",
                                message:
                                    "Deleting this custom workout entirely removes the exercise.",
                                onConfirm: () => {
                                    playDeleteSound();
                                    deleteCustomWorkout(item.id);
                                    setModalVisible(false);
                                },
                            });
                            setModalVisible(true);
                        }}
                        style={[
                            styles.button,
                            {
                                backgroundColor: "#f00",
                            },
                        ]}
                    ></PixelButton>
                )}
            </View>
        </View>
    );

    const sections = workoutCategories.map((category) => {
        const data = filterWorkoutsByArchitype(category.architype).filter((w) =>
            w.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return {
            title: category.label,
            data,
        };
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <PixelText
                    fontSize={22}
                    color="#0ff"
                    style={{ marginBottom: 20, textAlign: "center" }}
                >
                    🛒 Workout Shop
                </PixelText>
                <PixelText
                    fontSize={12}
                    color="#0ff"
                    style={{ marginBottom: 6 }}
                >
                    Search
                </PixelText>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search workouts..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => renderWorkoutItem(item)}
                    renderSectionHeader={({ section: { title } }) => (
                        <PixelText
                            fontSize={20}
                            color="#0ff"
                            style={{
                                marginBottom: 10,

                                paddingTop: 10,
                                backgroundColor: "#111",
                            }}
                        >
                            {title}
                        </PixelText>
                    )}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />

                {/* Modal for selecting split day when no default match */}
                {splitSelectionModalVisible && (
                    <PixelModal
                        visible={splitSelectionModalVisible}
                        title="Select a Split Day"
                        message="Choose a split day to save this workout to:"
                        onConfirm={() => {
                            if (selectedSplitDay && pendingSaveWorkout) {
                                SecureStore.getItemAsync("userId").then(
                                    (userIdStr) => {
                                        if (userIdStr) {
                                            saveWorkoutToSplit(
                                                pendingSaveWorkout.id,
                                                selectedSplitDayId!
                                            );
                                        }
                                    }
                                );
                            }
                            setSplitSelectionModalVisible(false);
                            setPendingSaveWorkout(null);
                            setSelectedSplitDay(null);
                        }}
                        onCancel={() => {
                            setSplitSelectionModalVisible(false);
                            setPendingSaveWorkout(null);
                            setSelectedSplitDay(null);
                        }}
                        confirmText="Save"
                        cancelText="Cancel"
                    >
                        <View style={{ marginBottom: 14 }}>
                            {splitOptions.map((day) => (
                                <TouchableOpacity
                                    key={day.id}
                                    onPress={() => {
                                        setSelectedSplitDay(day.name);
                                        setSelectedSplitDayId(day.id);
                                    }}
                                    style={{
                                        padding: 10,
                                        backgroundColor:
                                            selectedSplitDay === day.name
                                                ? "#0ff"
                                                : "#333",
                                        marginBottom: 6,
                                        borderRadius: 6,
                                    }}
                                >
                                    <PixelText fontSize={14} color="#000">
                                        {day.name}
                                    </PixelText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </PixelModal>
                )}

                <View style={styles.bottomButtonContainer}>
                    <PixelButton
                        text="Create your own workout"
                        onPress={toggleCreateWorkout}
                        containerStyle={{
                            marginBottom: Platform.OS === "ios" ? 0 : 8,
                        }}
                    ></PixelButton>

                    <CustomWorkoutModal
                        visible={showCustomWorkoutModal}
                        onConfirm={(data) => {
                            confirmCreateWorkout(data);
                            setShowCustomWorkoutModal(false);
                        }}
                        onCancel={() => setShowCustomWorkoutModal(false)}
                    />
                    <PixelModal
                        visible={modalVisible}
                        title={modalConfig.title}
                        message={modalConfig.message}
                        onConfirm={modalConfig.onConfirm}
                        onCancel={() => setModalVisible(false)}
                    />

                    <ConfirmationPixelModal
                        visible={modalConfirmationVisible}
                        title={modalConfirmationConfig.title}
                        message={modalConfirmationConfig.message}
                        onConfirm={modalConfirmationConfig.onConfirm}
                        onCancel={() => setModalConfirmationVisible(false)}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111",
    },
    container: {
        flex: 1,
        backgroundColor: "#111",
        paddingHorizontal: 20,
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
        marginBottom: "-6%",
        paddingTop: "3%",
    },
    searchInput: {
        backgroundColor: "#222",
        color: "#fff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        fontFamily: "PressStart2P_400Regular",
    },
});
