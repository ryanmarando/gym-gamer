import React, { useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    Keyboard,
} from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";
import * as SecureStore from "expo-secure-store";
import { authFetch } from "../utils/authFetch";

interface UpdateQuestModalProps {
    visible: boolean;
    onConfirm: (data: {
        customType: "GAIN" | "LOSE" | "MAINTAIN";
        customGoalAmount: number;
        customDeadline: string;
        initialWeight: number;
    }) => void;
    onCancel: () => void;
    title?: string;
}

export default function UpdateQuestModal({
    visible,
    onConfirm,
    onCancel,
    title = "Update Your Quest",
}: UpdateQuestModalProps) {
    const [customType, setCustomType] = useState<"GAIN" | "LOSE" | "MAINTAIN">(
        "GAIN"
    );
    const [goalAmount, setGoalAmount] = useState<string>("");
    const [deadline, setDeadline] = useState<string>("");
    const [initialWeight, setInitialWeight] = useState<string>("");

    React.useEffect(() => {
        const fetchLatestWeight = async () => {
            try {
                const userId = await SecureStore.getItemAsync("userId");
                const data = await authFetch(
                    `/user/getAllUserWeightEntries/${userId}`
                );
                if (
                    data &&
                    Array.isArray(data.user.weightEntries) &&
                    data.user.weightEntries.length > 0
                ) {
                    const sorted = [...data.user.weightEntries].sort(
                        (a, b) =>
                            new Date(b.enteredAt).getTime() -
                            new Date(a.enteredAt).getTime()
                    );
                    const latestWeight = sorted[0].weight;
                    setInitialWeight(latestWeight.toString());
                } else {
                    console.log(
                        "No bodyweight entries found. User must enter initial weight manually."
                    );
                }
            } catch (err) {
                console.error("Error fetching weight entries:", err);
            }
        };

        if (visible) {
            fetchLatestWeight();
        }
    }, [visible]);

    const parseLocalDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const handleConfirm = () => {
        const goal = parseFloat(goalAmount);
        if (
            isNaN(goal) ||
            isNaN(parseFloat(initialWeight)) ||
            deadline.trim() === "" ||
            goal === 0
        ) {
            alert(
                "Please enter a valid goal amount, initial weight, and deadline (YYYY-MM-DD)."
            );
            return;
        }

        const deadlineDate = parseLocalDate(deadline);
        const deadlineISO = deadlineDate.toISOString();

        onConfirm({
            customType,
            customGoalAmount: goal,
            customDeadline: deadlineISO,
            initialWeight: parseFloat(initialWeight),
        });

        setGoalAmount("");
        setDeadline("");
        setInitialWeight("");
        setCustomType("GAIN");
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableWithoutFeedback
                onPress={() => {
                    Keyboard.dismiss();
                }}
            >
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <PixelText
                                fontSize={14}
                                color="#0ff"
                                style={{ marginBottom: 12 }}
                            >
                                {title}
                            </PixelText>

                            <PixelText fontSize={10} color="#fff">
                                Select Goal Type:
                            </PixelText>
                            <View style={styles.typeSelector}>
                                {["GAIN", "LOSE", "MAINTAIN"].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeButton,
                                            customType === type &&
                                                styles.typeButtonSelected,
                                        ]}
                                        onPress={() =>
                                            setCustomType(
                                                type as
                                                    | "GAIN"
                                                    | "LOSE"
                                                    | "MAINTAIN"
                                            )
                                        }
                                    >
                                        <PixelText
                                            fontSize={12}
                                            color={
                                                customType === type
                                                    ? "#000"
                                                    : "#0ff"
                                            }
                                        >
                                            {type}
                                        </PixelText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <PixelText
                                fontSize={10}
                                color="#fff"
                                style={{ marginTop: 12 }}
                            >
                                New Goal Amount:
                            </PixelText>
                            <TextInput
                                placeholder="e.g. 15"
                                placeholderTextColor="#555"
                                value={goalAmount}
                                onChangeText={setGoalAmount}
                                style={styles.input}
                                keyboardType="numeric"
                            />

                            <PixelText
                                fontSize={10}
                                color="#fff"
                                style={{ marginTop: 12 }}
                            >
                                New Deadline (YYYY-MM-DD):
                            </PixelText>
                            <TextInput
                                placeholder="e.g. 2025-08-15"
                                placeholderTextColor="#555"
                                value={deadline}
                                onChangeText={setDeadline}
                                style={styles.input}
                            />
                            <PixelText
                                fontSize={10}
                                color="#fff"
                                style={{ marginTop: 12 }}
                            >
                                Initial Weight:
                            </PixelText>
                            <TextInput
                                placeholder="e.g. 160"
                                placeholderTextColor="#555"
                                value={initialWeight}
                                onChangeText={setInitialWeight}
                                style={styles.input}
                                keyboardType="numeric"
                            />

                            <View style={styles.buttonRow}>
                                <PixelButton
                                    text="Cancel"
                                    onPress={onCancel}
                                    fontSize={12}
                                    color="#f00"
                                    containerStyle={{
                                        flex: 1,
                                        justifyContent: "center",
                                        borderColor: "#f00",
                                    }}
                                />
                                <PixelButton
                                    text="Update Quest"
                                    onPress={handleConfirm}
                                    fontSize={12}
                                    color="#0f0"
                                    containerStyle={{
                                        flex: 1,
                                        justifyContent: "center",
                                        borderColor: "#0f0",
                                    }}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        marginTop: -100,
    },
    modalContainer: {
        backgroundColor: "#111",
        borderColor: "#0ff",
        borderWidth: 3,
        padding: 20,
        borderRadius: 8,
        width: "80%",
    },
    input: {
        backgroundColor: "#222",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 6,
        color: "#0ff",
        fontFamily: "PressStart2P_400Regular",
        fontSize: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        height: 45,
        marginTop: 4,
    },
    buttonRow: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    typeSelector: {
        flexDirection: "column",
        marginTop: 6,
        marginBottom: 6,
        justifyContent: "space-around",

        gap: 12,
    },
    typeButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: "#0ff",
        borderRadius: 6,
    },
    typeButtonSelected: {
        backgroundColor: "#0ff",
    },
});
