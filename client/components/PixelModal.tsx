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
    confirmText?: string;
    cancelText?: string;
    children?: React.ReactNode;
}

export default function PixelModal({
    visible,
    title = "Are you sure?",
    message,
    onConfirm,
    onCancel,
    confirmText = "Yes",
    cancelText = "No",
    children,
}: PixelModalProps) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        {title && (
                            <PixelText
                                fontSize={16}
                                color="#0ff"
                                style={{ marginBottom: 10 }}
                            >
                                {title}
                            </PixelText>
                        )}

                        {message && (
                            <PixelText
                                fontSize={14}
                                color="#fff"
                                style={{ marginBottom: 20, lineHeight: 19 }}
                            >
                                {message}
                            </PixelText>
                        )}

                        {children && (
                            <View style={styles.childrenWrapper}>
                                {children}
                            </View>
                        )}

                        <View style={styles.buttonRow}>
                            <PixelButton
                                text={confirmText}
                                onPress={onConfirm}
                                containerStyle={styles.button}
                            />
                            <PixelButton
                                text={cancelText}
                                onPress={onCancel}
                                containerStyle={styles.button}
                            />
                        </View>
                    </View>
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
        borderRadius: 8,
        padding: 20,
        alignItems: "center",
        width: "85%",
        maxHeight: "80%",
    },
    childrenWrapper: {
        flexGrow: 1,
        maxHeight: "60%",
        width: "100%",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 20,
        marginTop: 20,
    },
    button: {
        flex: 1,
    },
});
