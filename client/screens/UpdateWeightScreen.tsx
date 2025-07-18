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
    const [loading, setLoading] = useState(true); // true until fully ready
    //const [invalidModalVisible, setInvalidModalVisible] = useState(false);
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

    // Load userId once
    useEffect(() => {
        const loadUserId = async () => {
            const idStr = await SecureStore.getItemAsync("userId");
            if (idStr) {
                setUserId(Number(idStr));
            } else {
                Alert.alert("Error", "User ID not found.");
                setLoading(false);
            }
        };
        loadUserId();
    }, []);

    // Fetch weights only when userId is valid
    useEffect(() => {
        if (userId) {
            fetchWeights();
        }
    }, [userId]);

    const fetchWeights = async () => {
        try {
            const data = await authFetch(
                `/user/getAllUserWeightEntries/${userId}`
            );
            if (data?.user?.weightEntries) {
                const weights = data?.user?.weightEntries;
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
                onConfirm: () => {
                    setModalConfirmationConfig({
                        visible: false,
                        title: "Oh no, gamer",
                        message: "Failed to load weight entries!",
                        onConfirm: () => {},
                    });
                },
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
                onConfirm: () => {
                    setModalConfirmationConfig({
                        visible: false,
                        title: "Whoa there, gamer",
                        message: "Please enter a valid, positive number!",
                        onConfirm: () => {},
                    });
                },
            });
            return;
        }
        setModalConfig({
            visible: true,
            title: "Confirm Weight Entry",
            message: `Are you sure you want to add ${weightNum} lbs to your progress?`,
            onConfirm: handleConfirmAddWeight,
        });
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
                // Send notification
                sendNotification(result.newlyCompletedAchievements);

                result.newlyCompletedAchievements.forEach((ach: any) => {
                    console.log(`🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`);
                    // Show modal, play sound, push notification, etc.
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
                onConfirm: () => {
                    setModalConfirmationConfig({
                        visible: false,
                        title: "Oh no, gamer",
                        message: "Failed to add weight entry.",
                        onConfirm: () => {},
                    });
                },
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
                        {
                            method: "DELETE",
                        }
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
                        onConfirm: () => {
                            setModalConfirmationConfig({
                                visible: false,
                                title: "Oh no, gamer",
                                message: "Failed to delete last entry.",
                                onConfirm: () => {},
                            });
                        },
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
                        {
                            method: "DELETE",
                        }
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
                        onConfirm: () => {
                            setModalConfirmationConfig({
                                visible: false,
                                title: "Oh no, gamer",
                                message: "Failed to delete all entries.",
                                onConfirm: () => {},
                            });
                        },
                    });
                } finally {
                    setModalConfig((prev) => ({ ...prev, visible: false }));
                }
            },
        });
    };

    // Safe data prep — guard against empty weights
    const sortedWeights = [...weights].sort(
        (a, b) =>
            new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime()
    );
    const weightValues = sortedWeights.map((w) => w.weight);

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
                            lbs
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
                                placeholder="Enter your weight"
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

                            {weightValues.length > 0 && (
                                <View
                                    style={{
                                        padding: 10,
                                        maxHeight: 300,
                                        height: 300,
                                    }}
                                >
                                    <WeightEntriesList weights={weights} />
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
