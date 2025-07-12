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
        customType: "GAIN" | "LOSE" | "MAINTAIN";
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
    const [customType, setCustomType] = useState<"GAIN" | "LOSE" | "MAINTAIN">(
        "GAIN"
    );
    const [goalAmount, setGoalAmount] = useState<string>("");
    const [deadline, setDeadline] = useState<string>("");

    const parseLocalDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const handleConfirm = () => {
        const goal = parseFloat(goalAmount);
        if (isNaN(goal) || deadline.trim() === "") {
            alert(
                "Please enter a valid goal amount and deadline (YYYY-MM-DD)."
            );
            return;
        }

        const deadlineDate = parseLocalDate(deadline);
        const deadlineISO = deadlineDate.toISOString();

        onConfirm({
            customType,
            customGoalAmount: goal,
            customDeadline: deadlineISO,
        });

        setGoalAmount("");
        setDeadline("");
        setCustomType("GAIN");
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
