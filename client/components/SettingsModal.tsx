import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import PixelModal from "./PixelModal";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";
import { playCompleteSound } from "../utils/playCompleteSound";

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    selectedSystem: "IMPERIAL" | "METRIC";
    onChangeSystem: (system: "IMPERIAL" | "METRIC") => Promise<void>;
    isMuted: boolean;
    onToggleMuted: () => void;
    notificationsEnabled: boolean;
    onToggleNotifications: () => void;
    onConfirmDelete: () => void;
}

export default function SettingsModal({
    visible,
    onClose,
    selectedSystem,
    onChangeSystem,
    isMuted,
    onToggleMuted,
    notificationsEnabled,
    onToggleNotifications,
    onConfirmDelete,
}: SettingsModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [pendingSystem, setPendingSystem] = useState<
        "IMPERIAL" | "METRIC" | null
    >(null);

    if (!visible) return null;

    const handleSystemSelect = (system: "IMPERIAL" | "METRIC") => {
        if (system === selectedSystem) return;
        setPendingSystem(system);
        setConfirmVisible(true);
    };

    const handleConfirm = async () => {
        if (!pendingSystem) return;
        await onChangeSystem(pendingSystem);
        setConfirmVisible(false);
        setPendingSystem(null);
        playCompleteSound();
    };

    const handleCancel = () => {
        setConfirmVisible(false);
        setPendingSystem(null);
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <PixelText
                                fontSize={18}
                                color="#0ff"
                                style={{ marginBottom: 10 }}
                            >
                                Settings
                            </PixelText>

                            <PixelText
                                fontSize={16}
                                color="#fff"
                                style={{ marginBottom: 8 }}
                            >
                                Update Units (lbs/kg)
                            </PixelText>

                            {!confirmVisible ? (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        marginBottom: 10,
                                    }}
                                >
                                    <PixelButton
                                        text="lbs"
                                        onPress={() =>
                                            handleSystemSelect("IMPERIAL")
                                        }
                                        disabled={selectedSystem === "IMPERIAL"}
                                        containerStyle={{
                                            backgroundColor:
                                                selectedSystem === "IMPERIAL"
                                                    ? "#555"
                                                    : "#000",
                                            borderColor: "#fff",
                                            marginHorizontal: 8,
                                        }}
                                    />
                                    <PixelButton
                                        text="kg"
                                        onPress={() =>
                                            handleSystemSelect("METRIC")
                                        }
                                        disabled={selectedSystem === "METRIC"}
                                        containerStyle={{
                                            backgroundColor:
                                                selectedSystem === "METRIC"
                                                    ? "#555"
                                                    : "#000",
                                            borderColor: "#fff",
                                            marginHorizontal: 8,
                                        }}
                                    />
                                </View>
                            ) : (
                                <View style={{ marginBottom: 20 }}>
                                    <PixelText
                                        fontSize={14}
                                        color="#fff"
                                        style={{ marginBottom: 12 }}
                                    >
                                        Are you sure you want to switch to{" "}
                                        {pendingSystem === "IMPERIAL"
                                            ? "Imperial (lbs)"
                                            : "Metric (kg)"}
                                        ?
                                    </PixelText>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <PixelButton
                                            text="Confirm"
                                            onPress={handleConfirm}
                                            color="#0f0"
                                            containerStyle={{
                                                marginHorizontal: 8,
                                            }}
                                        />
                                        <PixelButton
                                            text="Cancel"
                                            onPress={handleCancel}
                                            color="#f00"
                                            containerStyle={{
                                                marginHorizontal: 8,
                                            }}
                                        />
                                    </View>
                                </View>
                            )}

                            <PixelButton
                                text={
                                    isMuted
                                        ? "Unmute App Sounds"
                                        : "Mute App Sounds"
                                }
                                onPress={onToggleMuted}
                                color="#FFD700"
                                containerStyle={styles.button}
                            />

                            <PixelButton
                                text={
                                    notificationsEnabled
                                        ? "Turn Off Notifications"
                                        : "Turn On Notifications"
                                }
                                onPress={onToggleNotifications}
                                color="#7FFF00"
                                containerStyle={styles.button}
                            />

                            <PixelButton
                                text="Delete Account"
                                onPress={() => setShowDeleteConfirm(true)}
                                color="#FF4C4C"
                                containerStyle={styles.button}
                            />

                            <PixelButton
                                text="Close"
                                onPress={onClose}
                                color="#888"
                                containerStyle={[
                                    styles.button,
                                    { marginTop: 20 },
                                ]}
                            />

                            {/* Nested confirmation modal */}
                            {showDeleteConfirm && (
                                <PixelModal
                                    visible={showDeleteConfirm}
                                    title="Confirm Delete"
                                    message="Are you sure you want to delete your account? This cannot be undone."
                                    onConfirm={() => {
                                        onConfirmDelete();
                                        setShowDeleteConfirm(false);
                                        onClose();
                                    }}
                                    onCancel={() => setShowDeleteConfirm(false)}
                                    confirmText="Delete"
                                    cancelText="Cancel"
                                />
                            )}
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
        borderRadius: 8,
        padding: 20,
        width: "85%",
        maxHeight: "90%",
    },
    button: {
        borderColor: "#fff",
        marginTop: 10,
    },
});
