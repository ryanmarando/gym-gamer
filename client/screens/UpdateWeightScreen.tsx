import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import * as SecureStore from "expo-secure-store";

import PixelButton from "../components/PixelButton";
import PixelText from "../components/PixelText";
import PixelModal from "../components/PixelModal";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import WeightEntriesList from "../components/WeightEntriesList";
import { authFetch } from "../utils/authFetch";
import { sendPushNotification } from "../utils/notification";
import { SafeAreaView } from "react-native-safe-area-context";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import { playDeleteSound } from "../utils/playDeleteSound";
import { playQuickAddSound } from "../utils/playQuickAddSound";

export default function UpdateWeightScreen({ navigation }: any) {
    const [userId, setUserId] = useState<number | null>(null);
    const [weights, setWeights] = useState<
        { id: number; userId: number; weight: number; enteredAt: string }[]
    >([]);
    const [newWeight, setNewWeight] = useState("");
    const [loading, setLoading] = useState(true);
    const [weightSystem, setWeightSystem] = useState<"IMPERIAL" | "METRIC">(
        "IMPERIAL"
    );
    const [modalConfig, setModalConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        visible: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });
    const [modalConfirmationConfig, setModalConfirmationConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        visible: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    // Load userId and weightSystem once
    useEffect(() => {
        const loadUserData = async () => {
            const idStr = await SecureStore.getItemAsync("userId");
            if (!idStr) {
                Alert.alert("Error", "User ID not found.");
                setLoading(false);
                return;
            }

            setUserId(Number(idStr));

            const weightSystem = await SecureStore.getItemAsync("weightSystem");
            if (weightSystem === "METRIC" || weightSystem === "IMPERIAL") {
                setWeightSystem(weightSystem);
            }
        };
        loadUserData();
    }, []);

    // Fetch weights only when userId is valid
    useEffect(() => {
        if (userId !== null) {
            fetchWeights();
        }
    }, [userId]);

    const fetchWeights = async () => {
        try {
            const data = await authFetch(
                `/user/getAllUserWeightEntries/${userId}`
            );
            if (data?.user?.weightEntries) {
                const weights = data.user.weightEntries;
                setWeights(weights);
                console.log("✅ Weights:", weights.length, "entries found.");
            } else {
                console.warn("⚠️ No weightEntries found");
            }
        } catch (err) {
            console.error(err);
            playBadMoveSound();
            setModalConfirmationConfig({
                visible: true,
                title: "Oh no, gamer",
                message: "Failed to load weight entries!",
                onConfirm: () =>
                    setModalConfirmationConfig((prev) => ({
                        ...prev,
                        visible: false,
                    })),
            });
        } finally {
            setLoading(false);
        }
    };

    // Open modal after checking input validity
    const handleAddWeightPress = () => {
        const weightNum = parseFloat(newWeight);
        if (isNaN(weightNum) || weightNum <= 0) {
            playBadMoveSound();
            setModalConfirmationConfig({
                visible: true,
                title: "Whoa there, gamer",
                message: "Please enter a valid, positive number!",
                onConfirm: () =>
                    setModalConfirmationConfig((prev) => ({
                        ...prev,
                        visible: false,
                    })),
            });
            return;
        }

        // Use dynamic unit here
        const unit = weightSystem === "METRIC" ? "kg" : "lbs";

        setModalConfig({
            visible: true,
            title: "Confirm Weight Entry",
            message: `Are you sure you want to add ${weightNum} ${unit} to your progress?`,
            onConfirm: handleConfirmAddWeight,
        });
    };

    const sendNotification = async (newCompletedAchievements: any[]) => {
        const expoPushToken = await SecureStore.getItemAsync("notifToken");
        if (!expoPushToken) return;

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

    // Called when user confirms modal
    const handleConfirmAddWeight = async () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        const weightNum = parseFloat(newWeight);
        try {
            setLoading(true);
            const result = await authFetch(
                `/user/addUserWeightEntry/${userId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ weight: weightNum }),
                }
            );
            if (result.newlyCompletedAchievements?.length) {
                sendNotification(result.newlyCompletedAchievements);

                result.newlyCompletedAchievements.forEach((ach: any) => {
                    console.log(`🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`);
                });
            }
            playQuickAddSound();
            setNewWeight("");
            await fetchWeights();
        } catch (err) {
            console.error(err);
            playBadMoveSound();
            setModalConfirmationConfig({
                visible: true,
                title: "Oh no, gamer",
                message: "Failed to add weight entry.",
                onConfirm: () =>
                    setModalConfirmationConfig((prev) => ({
                        ...prev,
                        visible: false,
                    })),
            });
            setLoading(false);
        }
    };

    const handleDeleteLastBodyWeightEntry = async () => {
        setModalConfig({
            visible: true,
            title: "Delete Last Entry",
            message:
                "Are you sure you want to delete your last bodyweight entry?",
            onConfirm: async () => {
                try {
                    await authFetch(
                        `/user/deleteLastUserWeightEntry/${userId}`,
                        { method: "DELETE" }
                    );
                    playDeleteSound();
                    await fetchWeights();
                } catch (err) {
                    console.error(err);
                    playBadMoveSound();
                    setModalConfirmationConfig({
                        visible: true,
                        title: "Oh no, gamer",
                        message: "Failed to delete last entry.",
                        onConfirm: () =>
                            setModalConfirmationConfig((prev) => ({
                                ...prev,
                                visible: false,
                            })),
                    });
                } finally {
                    setModalConfig((prev) => ({ ...prev, visible: false }));
                }
            },
        });
    };

    const handleDeleteAllBodyWeightEntries = async () => {
        setModalConfig({
            visible: true,
            title: "Delete All Entries",
            message: "Are you sure you want to delete ALL bodyweight entries?",
            onConfirm: async () => {
                try {
                    await authFetch(
                        `/user/deleteAllUserWeightEntries/${userId}`,
                        { method: "DELETE" }
                    );
                    playDeleteSound();
                    await fetchWeights();
                } catch (err) {
                    console.error(err);
                    playBadMoveSound();
                    setModalConfirmationConfig({
                        visible: true,
                        title: "Oh no, gamer",
                        message: "Failed to delete all entries.",
                        onConfirm: () =>
                            setModalConfirmationConfig((prev) => ({
                                ...prev,
                                visible: false,
                            })),
                    });
                } finally {
                    setModalConfig((prev) => ({ ...prev, visible: false }));
                }
            },
        });
    };

    const sortedWeights = [...weights].sort(
        (a, b) =>
            new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime()
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.container}>
                    {loading && <ActivityIndicator color="#0ff" size="large" />}

                    {!loading && sortedWeights.length > 0 && (
                        <PixelText
                            fontSize={18}
                            color="#0ff"
                            style={{ marginBottom: 10 }}
                        >
                            Latest Weight:{" "}
                            {sortedWeights[
                                sortedWeights.length - 1
                            ].weight.toFixed(1)}{" "}
                            {weightSystem === "METRIC" ? "kg" : "lbs"}
                        </PixelText>
                    )}

                    {!loading && sortedWeights.length === 0 && (
                        <PixelText
                            fontSize={14}
                            color="#888"
                            style={{ marginBottom: 10 }}
                        >
                            No weight entries found.
                        </PixelText>
                    )}

                    {!loading && (
                        <>
                            <TextInput
                                placeholder={`Enter your weight (${
                                    weightSystem === "METRIC" ? "kg" : "lbs"
                                })`}
                                keyboardType="numeric"
                                value={newWeight}
                                onChangeText={setNewWeight}
                                placeholderTextColor="#999"
                                style={styles.input}
                            />

                            <PixelButton
                                text="Add Weight"
                                onPress={handleAddWeightPress}
                                color="#0f0"
                                containerStyle={{ marginBottom: 20 }}
                            />

                            {sortedWeights.length > 0 && (
                                <View
                                    style={{
                                        padding: 10,
                                        maxHeight: 300,
                                        height: 300,
                                    }}
                                >
                                    <WeightEntriesList
                                        weights={weights}
                                        weightSystem={weightSystem}
                                    />
                                </View>
                            )}

                            {!loading && sortedWeights.length > 0 && (
                                <PixelButton
                                    text="Delete Last Bodyweight Entry"
                                    onPress={handleDeleteLastBodyWeightEntry}
                                    color="#0f0"
                                    containerStyle={{ marginBottom: 2 }}
                                />
                            )}
                            {!loading && sortedWeights.length > 1 && (
                                <PixelButton
                                    text="Delete All Bodyweight Entries"
                                    onPress={handleDeleteAllBodyWeightEntries}
                                    color="#0f0"
                                    containerStyle={{ marginBottom: 20 }}
                                />
                            )}

                            <PixelButton
                                text="Go Back"
                                onPress={() => navigation.goBack()}
                                color="#00f"
                                containerStyle={{ marginTop: 20 }}
                            />

                            {/* Confirmation Modal */}
                            <PixelModal
                                visible={modalConfig.visible}
                                title={modalConfig.title}
                                message={modalConfig.message}
                                onConfirm={modalConfig.onConfirm}
                                onCancel={() =>
                                    setModalConfig((prev) => ({
                                        ...prev,
                                        visible: false,
                                    }))
                                }
                            />
                            <ConfirmationPixelModal
                                visible={modalConfirmationConfig.visible}
                                title={modalConfirmationConfig.title}
                                message={modalConfirmationConfig.message}
                                onConfirm={() =>
                                    modalConfirmationConfig.onConfirm()
                                }
                                onCancel={() =>
                                    modalConfirmationConfig.onConfirm()
                                }
                            />
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
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
        padding: 20,
        justifyContent: "flex-start",
    },
    input: {
        height: Platform.OS === "ios" ? 40 : undefined,
        borderColor: "#0ff",
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: "#fff",
        fontFamily: "PressStart2P_400Regular",
        paddingVertical: Platform.OS === "android" ? 18 : 0,
    },
});
