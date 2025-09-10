import React, { useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";
import * as SecureStore from "expo-secure-store";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import { convertWeight, roundToNearestHalf } from "../utils/unitUtils";
import ConfirmationPixelModal from "./ConfirmationPixelModal";
import * as SQLite from "expo-sqlite";
import { UserWeightEntry } from "../types/db";

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
    const [isPixelModalVisible, setPixelModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [weightSystem, setWeightSystem] = useState<string>();

    React.useEffect(() => {
        const fetchLatestWeight = async () => {
            try {
                const userId = await SecureStore.getItemAsync("userId");

                const weightSystem = await SecureStore.getItemAsync(
                    "weightSystem"
                );
                if (weightSystem) setWeightSystem(weightSystem);

                const db = await SQLite.openDatabaseAsync("gymgamer.db");

                const weights: UserWeightEntry[] = await db.getAllAsync(
                    "SELECT * FROM user_weight_entries ORDER BY entered_at DESC"
                );

                if (weights && weights.length > 0) {
                    const sorted = weights.sort(
                        (a, b) =>
                            new Date(b.entered_at).getTime() -
                            new Date(a.entered_at).getTime()
                    );
                    console.log(sorted);
                    let latestWeight = sorted[0].weight;
                    if (weightSystem === "METRIC")
                        latestWeight = roundToNearestHalf(
                            convertWeight(latestWeight, "METRIC")
                        );
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

    function validateDate(dateStr: string): boolean {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(dateStr);

        return (
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day
        );
    }

    function isDateAfterToday(dateStr: string): boolean {
        if (!validateDate(dateStr.split("T")[0].replace(/\s+/g, "")))
            return false;

        const inputDate = new Date(dateStr.split("T")[0].replace(/\s+/g, ""));
        const today = new Date();

        // Reset time on today's date so only the date is compared
        today.setHours(0, 0, 0, 0);

        return inputDate > today;
    }

    const handleConfirm = () => {
        let goal = parseFloat(goalAmount);
        const dateOnly = deadline.split("T")[0].replace(/\s+/g, "");

        if (
            (customType !== "MAINTAIN" && (isNaN(goal) || goal <= 0)) ||
            isNaN(parseFloat(initialWeight)) ||
            deadline.trim() === "" ||
            !validateDate(dateOnly) ||
            !isDateAfterToday(deadline)
        ) {
            playBadMoveSound();
            setModalMessage(
                "Please enter a valid goal amount, initial weight, and deadline (YYYY-MM-DD) after today."
            );
            setPixelModalVisible(true);
            return;
        }

        // Cant lose more weight than you initally weight
        if (goal >= parseFloat(initialWeight) && customType === "LOSE") {
            playBadMoveSound();
            setModalMessage(
                "Your weight goal can't be greater than your initial weight."
            );
            setPixelModalVisible(true);
            return;
        }

        // Goal to LOSE or GAIN is unreasonable
        if (goal >= 500) {
            playBadMoveSound();
            setModalMessage("Let's enter a more reasonable goal.");
            setPixelModalVisible(true);
            setGoalAmount("");
            return;
        }

        // If maintain is on the send 1 to backend
        if (isNaN(goal)) goal = 1;

        const deadlineDate = parseLocalDate(deadline);
        const deadlineISO = deadlineDate.toISOString();
        let initWeight = parseFloat(initialWeight);

        if (weightSystem === "METRIC") {
            goal = convertWeight(goal, "IMPERIAL");
            initWeight = convertWeight(parseFloat(initialWeight), "IMPERIAL");

            // Round both to the nearest 0.5
            goal = Math.round(goal * 2) / 2;
            initWeight = Math.round(initWeight * 2) / 2;
        }

        onConfirm({
            customType,
            customGoalAmount: goal,
            customDeadline: deadlineISO,
            initialWeight: initWeight,
        });

        setGoalAmount("");
        setDeadline("");
        setInitialWeight("");
        setCustomType("GAIN");
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? -20 : 0}
            >
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss}
                    accessible={false}
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
                                    {["GAIN", "LOSE", "MAINTAIN"].map(
                                        (type) => (
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
                                        )
                                    )}
                                </View>

                                <ConfirmationPixelModal
                                    visible={isPixelModalVisible}
                                    title="Whoa there, gamer!"
                                    message={modalMessage}
                                    onConfirm={() =>
                                        setPixelModalVisible(false)
                                    }
                                    onCancel={() => setPixelModalVisible(false)}
                                ></ConfirmationPixelModal>
                                {customType !== "MAINTAIN" && (
                                    <View>
                                        <PixelText
                                            fontSize={10}
                                            color="#fff"
                                            style={{ marginTop: 12 }}
                                        >
                                            How Much Weight To {customType}:
                                        </PixelText>
                                        <TextInput
                                            placeholder="e.g. 15"
                                            placeholderTextColor="#555"
                                            value={goalAmount}
                                            onChangeText={setGoalAmount}
                                            style={styles.input}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                )}

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
            </KeyboardAvoidingView>
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
