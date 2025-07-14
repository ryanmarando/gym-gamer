import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { LineChart, Grid, YAxis, XAxis } from "react-native-svg-charts";
import PixelButton from "../components/PixelButton";
import PixelText from "../components/PixelText";
import PixelModal from "../components/PixelModal";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import { authFetch } from "../utils/authFetch";
import { sendPushNotification } from "../utils/notification";

export default function UpdateWeightScreen({ navigation }: any) {
    const [userId, setUserId] = useState<number | null>(null);
    const [weights, setWeights] = useState<
        { weight: number; enteredAt: string }[]
    >([]);
    const [newWeight, setNewWeight] = useState("");
    const [loading, setLoading] = useState(true); // true until fully ready
    const [invalidModalVisible, setInvalidModalVisible] = useState(false);
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
                setWeights(data.user.weightEntries);
                console.log("✅ Weights:", data.user.weightEntries);
            } else {
                console.warn("⚠️ No weightEntries found");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load weight entries.");
        } finally {
            setLoading(false);
        }
    };

    // Open modal after checking input validity
    const handleAddWeightPress = () => {
        const weightNum = parseFloat(newWeight);
        if (isNaN(weightNum) || weightNum <= 0) {
            setInvalidModalVisible(true);
            return;
        }
        setModalConfig({
            visible: true,
            title: "Confirm Weight Entry",
            message: `Are you sure you want to add ${weightNum} lbs to your progress?`,
            onConfirm: handleConfirmAddWeight,
        });
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
                sendNotification(result.newlyCompletedAchievements?.length);

                result.newlyCompletedAchievements.forEach((ach: any) => {
                    console.log(`🏆 Unlocked: ${ach.name} (+${ach.xp} XP)`);
                    // Show modal, play sound, push notification, etc.
                });
            }
            setNewWeight("");
            await fetchWeights();
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to add weight entry.");
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
                    await fetchWeights();
                } catch (err) {
                    console.error(err);
                    Alert.alert("Error", "Failed to delete last entry.");
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
                    await fetchWeights();
                } catch (err) {
                    console.error(err);
                    Alert.alert("Error", "Failed to delete all entries.");
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
    const dates = sortedWeights.map((w) =>
        new Date(w.enteredAt).toLocaleDateString()
    );

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator color="#0ff" size="large" />}

            {!loading && sortedWeights.length > 0 && (
                <PixelText
                    fontSize={18}
                    color="#0ff"
                    style={{ marginBottom: 10 }}
                >
                    Latest Weight:{" "}
                    {sortedWeights[sortedWeights.length - 1].weight.toFixed(1)}{" "}
                    lbs
                </PixelText>
            )}

            {!loading && sortedWeights.length === 1 && (
                <PixelText
                    fontSize={10}
                    color="#0ff"
                    style={{ marginBottom: 10 }}
                >
                    Please enter two entries for a chart.
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

                    {weightValues.length > 1 && (
                        <View style={{ height: 250, padding: 10 }}>
                            <View style={{ flexDirection: "row", flex: 1 }}>
                                <YAxis
                                    data={weightValues}
                                    contentInset={{ top: 20, bottom: 20 }}
                                    svg={{
                                        fill: "#0ff",
                                        fontSize: 8,
                                        fontFamily: "PressStart2P_400Regular",
                                    }}
                                    numberOfTicks={6}
                                    formatLabel={(value: any) =>
                                        value.toFixed(1)
                                    }
                                />

                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <LineChart
                                        style={{ flex: 1 }}
                                        data={weightValues}
                                        svg={{ stroke: "#0ff" }}
                                        contentInset={{ top: 20, bottom: 30 }} // More bottom space for labels
                                    >
                                        <Grid
                                            svg={{
                                                stroke: "#333",
                                                strokeDasharray: [4, 4],
                                            }}
                                        />
                                    </LineChart>

                                    <XAxis
                                        style={{
                                            marginTop: 8,
                                            height: 40,
                                        }}
                                        data={weightValues}
                                        formatLabel={(value, index) => {
                                            const date = dates[index];
                                            if (!date) return ""; // fallback if date is undefined
                                            const [month, day, year] =
                                                date.split("/");
                                            return `${month}/${day}/${year}`;
                                        }}
                                        contentInset={{ left: 20, right: 20 }}
                                        svg={{
                                            fill: "#0ff",
                                            fontSize: 8,
                                            y: 15,
                                            rotation: 0,
                                            originY: 0,
                                            fontFamily:
                                                "PressStart2P_400Regular",
                                        }}
                                        numberOfTicks={Math.min(
                                            dates.length,
                                            2
                                        )}
                                    />
                                </View>
                            </View>
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
                        visible={invalidModalVisible}
                        title="Whoa there, gamer!"
                        message="Please enter a valid positive number!"
                        onConfirm={() => setInvalidModalVisible(false)}
                        onCancel={() => setInvalidModalVisible(false)}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
        padding: 20,
        justifyContent: "flex-start",
        paddingVertical: "20%",
    },
    input: {
        height: 40,
        borderColor: "#0ff",
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: "#fff",
        fontFamily: "PressStart2P_400Regular",
    },
});
