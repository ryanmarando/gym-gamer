import React from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";

interface PixelModalProps {
    visible: boolean;
    title?: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function PixelModal({
    visible,
    title = "Are you sure?",
    message,
    onConfirm,
    onCancel,
}: PixelModalProps) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            {title && (
                                <PixelText
                                    fontSize={12}
                                    color="#0ff"
                                    style={{ marginBottom: 10 }}
                                >
                                    {title}
                                </PixelText>
                            )}
                            {message && (
                                <PixelText
                                    fontSize={10}
                                    color="#fff"
                                    style={{ marginBottom: 20 }}
                                >
                                    {message}
                                </PixelText>
                            )}
                            <View style={styles.buttonRow}>
                                <PixelButton
                                    text="Yes"
                                    onPress={onConfirm}
                                    containerStyle={styles.button}
                                />
                                <PixelButton
                                    text="No"
                                    onPress={onCancel}
                                    containerStyle={styles.button}
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
        alignItems: "center",
        width: "80%",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 20,
    },
    button: {
        flex: 1,
    },
});
