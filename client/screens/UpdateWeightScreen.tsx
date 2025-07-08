import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    Dimensions,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { LineChart, Grid, YAxis } from "react-native-svg-charts";
import PixelButton from "../components/PixelButton";
import PixelText from "../components/PixelText";
import PixelModal from "../components/PixelModal"; // import your PixelModal here
import { authFetch } from "../utils/authFetch";

export default function UpdateWeightScreen({ navigation }: any) {
    const [userId, setUserId] = useState<number | null>(null);
    const [weights, setWeights] = useState<
        { weight: number; enteredAt: string }[]
    >([]);
    const [newWeight, setNewWeight] = useState("");
    const [loading, setLoading] = useState(true); // true until fully ready
    const [modalVisible, setModalVisible] = useState(false); // modal visibility

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
            Alert.alert(
                "Invalid input",
                "Please enter a valid positive number."
            );
            return;
        }
        setModalVisible(true);
    };

    // Called when user confirms modal
    const handleConfirmAddWeight = async () => {
        setModalVisible(false);
        const weightNum = parseFloat(newWeight);
        try {
            setLoading(true);
            await authFetch(`/user/addUserWeightEntry/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ weight: weightNum }),
            });
            setNewWeight("");
            await fetchWeights();
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to add weight entry.");
            setLoading(false);
        }
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
                        <View
                            style={{
                                height: 200,
                                flexDirection: "row",
                                padding: 10,
                            }}
                        >
                            <YAxis
                                data={weightValues}
                                contentInset={{ top: 20, bottom: 20 }}
                                svg={{ fill: "grey", fontSize: 10 }}
                                numberOfTicks={6}
                                formatLabel={(value: any) => value.toFixed(0)}
                            />
                            <LineChart
                                style={{ flex: 1 }}
                                data={weightValues} // ✅ just an array of numbers!
                                svg={{ stroke: "#0ff" }}
                                contentInset={{ top: 20, bottom: 20 }}
                            >
                                <Grid />
                            </LineChart>
                        </View>
                    )}

                    <PixelButton
                        text="Go Back"
                        onPress={() => navigation.goBack()}
                        color="#00f"
                        containerStyle={{ marginTop: 20 }}
                    />

                    {/* Confirmation Modal */}
                    <PixelModal
                        visible={modalVisible}
                        title="Confirm Weight Entry"
                        message={`Are you sure you want to add ${newWeight} lbs to your progress?`}
                        onConfirm={handleConfirmAddWeight}
                        onCancel={() => setModalVisible(false)}
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
    },
});
