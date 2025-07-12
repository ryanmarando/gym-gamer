import React, { useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    ScrollView,
} from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";

const ARCHITYPES = [
    "PUSH",
    "PULL",
    "LEGS",
    "CHEST",
    "SHOULDERS",
    "ARMS",
    "BACK",
    "ABS",
    "QUADS",
    "HAMSTRINGS",
    "CALVES",
    "GLUTES",
];

interface CustomWorkoutModalProps {
    visible: boolean;
    onConfirm: (data: { customName: string; architype: string[] }) => void;
    onCancel: () => void;
    title?: string;
}

export default function CustomWorkoutModal({
    visible,
    onConfirm,
    onCancel,
    title = "Create Custom Workout",
}: CustomWorkoutModalProps) {
    const [customName, setCustomName] = useState("");
    const [selectedArchitypes, setSelectedArchitypes] = useState<string[]>([]);

    const toggleArchitype = (architype: string) => {
        setSelectedArchitypes((prev) =>
            prev.includes(architype)
                ? prev.filter((a) => a !== architype)
                : [...prev, architype]
        );
    };

    const handleConfirm = () => {
        if (customName.trim() === "" || selectedArchitypes.length === 0) {
            alert(
                "Please enter a workout name and select at least one architype."
            );
            return;
        }
        onConfirm({
            customName: customName.trim(),
            architype: selectedArchitypes,
        });
        setCustomName("");
        setSelectedArchitypes([]);
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <PixelText
                                fontSize={14}
                                color="#f0f"
                                style={{ marginBottom: 12 }}
                            >
                                {title}
                            </PixelText>

                            <TextInput
                                placeholder="Workout Name"
                                placeholderTextColor="#555"
                                value={customName}
                                onChangeText={setCustomName}
                                style={styles.input}
                            />

                            <PixelText
                                fontSize={14}
                                color="#f0f"
                                style={{ marginTop: 12 }}
                            >
                                Choose workout type:
                            </PixelText>

                            <ScrollView
                                style={styles.architypeList}
                                contentContainerStyle={{}}
                            >
                                {ARCHITYPES.map((arch) => {
                                    const selected =
                                        selectedArchitypes.includes(arch);
                                    return (
                                        <TouchableOpacity
                                            key={arch}
                                            onPress={() =>
                                                toggleArchitype(arch)
                                            }
                                            style={[
                                                styles.architypeItem,
                                                selected &&
                                                    styles.architypeItemSelected,
                                            ]}
                                        >
                                            <PixelText
                                                fontSize={12}
                                                color={
                                                    selected ? "#000" : "#0ff"
                                                }
                                            >
                                                {arch}
                                            </PixelText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

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
                                    text="Add Workout"
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
    },
    modalContainer: {
        backgroundColor: "#111",
        borderColor: "#0ff",
        borderWidth: 3,
        padding: 20,
        borderRadius: 8,
        width: "80%",
        height: "60%",
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
    },
    architypeList: {
        marginTop: 12,
        maxHeight: 540,
    },
    architypeItem: {
        padding: 10,
        borderColor: "#0ff",
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 8,
    },
    architypeItemSelected: {
        backgroundColor: "#0ff",
    },
    buttonRow: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
});
