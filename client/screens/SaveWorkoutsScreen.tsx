import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    StyleSheet,
    FlatList,
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
import { playPixelSound } from "../utils/playPixelSound";

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

    const saveWorkoutToSplit = async (
        userId: number,
        workoutId: number,
        splitDay: string
    ) => {
        await authFetch(
            `/workouts/saveToUser?userId=${userId}&workoutId=${workoutId}`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    dayId: selectedSplitDayId,
                }),
            }
        );
        const added = allWorkouts.find((w) => w.id === workoutId);
        if (added) setUserWorkouts((prev) => [...prev, added]);
        fetchWorkouts();
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
                        "Removing this workout will delete all previous entries.",
                    onConfirm: () => confirmRemoveWorkout(workoutId),
                });
                setModalVisible(true);
            } else {
                // ✅ Always let them choose the day, but preselect if there's a match
                const userData = await authFetch(`/user/${userId}`);
                const userSplits = userData?.workoutSplit?.[0]?.days || [];

                const matchingDay = workout.architype.find((type: string) =>
                    userSplits.some((day: any) => day.dayName === type)
                );

                const splitOptions = userSplits.map((d: any) => ({
                    id: d.id,
                    name: d.dayName,
                }));

                setSplitOptions(splitOptions);
                setPendingSaveWorkout(workout);

                if (matchingDay) {
                    const matchedDay = userSplits.find(
                        (day: any) => day.dayName === matchingDay
                    );
                    if (matchedDay) {
                        setSelectedSplitDay(matchedDay.dayName);
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
            const userId = Number(await SecureStore.getItemAsync("userId"));

            await authFetch(
                `/workouts/deleteFromUser?userId=${userId}&workoutId=${workoutId}`,
                { method: "DELETE" }
            );

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
        <View style={styles.container}>
            <PixelText
                fontSize={22}
                color="#0ff"
                style={{ marginBottom: 20, textAlign: "center" }}
            >
                🛒 Workout Shop
            </PixelText>
            <PixelText fontSize={12} color="#0ff" style={{ marginBottom: 6 }}>
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
                                        const userId = Number(userIdStr);
                                        saveWorkoutToSplit(
                                            userId,
                                            pendingSaveWorkout.id,
                                            selectedSplitDay
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
                                    setSelectedSplitDayId(day.id); // new!
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
        marginBottom: "-19%",
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
