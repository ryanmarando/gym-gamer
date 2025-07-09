import React, { useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
} from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";

interface UpdateQuestModalProps {
    visible: boolean;
    onConfirm: (data: {
        customGoalAmount: number;
        customDeadline: string;
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
    const [goalAmount, setGoalAmount] = useState<string>("");
    const [deadline, setDeadline] = useState<string>("");

    const handleConfirm = () => {
        const goal = parseFloat(goalAmount);
        if (isNaN(goal) || deadline.trim() === "") {
            alert(
                "Please enter a valid goal amount and deadline (YYYY-MM-DD)."
            );
            return;
        }

        // Convert deadline to ISO format if needed
        const deadlineISO = new Date(deadline).toISOString();

        onConfirm({
            customGoalAmount: goal,
            customDeadline: deadlineISO,
        });

        setGoalAmount("");
        setDeadline("");
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableWithoutFeedback onPress={onCancel}>
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
});
