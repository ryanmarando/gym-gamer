import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    TextInput,
} from "react-native";
import PixelModal from "./PixelModal";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";
import ConfirmationPixelModal from "./ConfirmationPixelModal";
import { playCompleteSound } from "../utils/playCompleteSound";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import { playDeleteSound } from "../utils/playDeleteSound";
import * as SecureStore from "expo-secure-store";
import { authFetch } from "../utils/authFetch";
import SubscriptionWebView from "./SubscriptionWebView";
import { playExcitingSound } from "../utils/playExcitingSound";

type SubscriptionState = {
    isSubscribed: boolean;
    subscriptionEndDate: Date | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
};

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
    confirmationPixelModalVisible: boolean;
    setConfirmationPixelModalVisible: (b: boolean) => void;
    confirmationPixelModalTitle: string;
    setConfirmationPixelModalTitle: (b: string) => void;
    confirmationPixelModalMessage: string;
    setConfirmationPixelModalMessage: (b: string) => void;
    handleSupportConfirmSend: (
        fromEmail: string,
        message: string
    ) => Promise<boolean>;
    userEmail: string;
    optedIn: boolean;
    toggleOpt: () => void;
    navigation: any;
    subscription: SubscriptionState;
    fetchUserData: () => void;
    setShowSettings: (b: boolean) => void;
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
    confirmationPixelModalVisible,
    setConfirmationPixelModalVisible,
    confirmationPixelModalTitle,
    setConfirmationPixelModalTitle,
    confirmationPixelModalMessage,
    setConfirmationPixelModalMessage,
    userEmail,
    handleSupportConfirmSend,
    optedIn,
    toggleOpt,
    navigation,
    subscription,
    fetchUserData,
    setShowSettings,
}: SettingsModalProps) {
    const [showPixelModal, setShowPixelModal] = useState(false);
    const [pixelModalTitle, setPixelModalTitle] = useState<string>("");
    const [pixelModalMessage, setPixelModalMessage] = useState<string>("");
    const [pixelModalMode, setPixelModalMode] = useState<string>("");
    const [pixelModalButton, setPixelModalButton] = useState<string>("");
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [pendingSystem, setPendingSystem] = useState<
        "IMPERIAL" | "METRIC" | null
    >(null);
    const [supportModalVisible, setSupportModalVisible] = useState(false);
    const [supportFromEmail, setSupportFromEmail] = useState(userEmail);
    const [supportMessage, setSupportMessage] = useState("");
    const [supportConfirmVisible, setSupportConfirmVisible] = useState(false);
    const [sessionUrl, setSessionUrl] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isConfirmingSucessSubscription, setIsConfirmingSuccessSubscription] =
        useState<boolean>(false);

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

    // NEW: Support modal handlers
    const openSupportModal = () => {
        setSupportFromEmail(userEmail);
        setSupportMessage("");
        setSupportConfirmVisible(false);
        setSupportModalVisible(true);
        setPixelModalMode("support");
    };

    const closeSupportModal = () => {
        setSupportModalVisible(false);
        setSupportConfirmVisible(false);
    };

    const handleSupportSendPress = async () => {
        const sent = await handleSupportConfirmSend(
            supportFromEmail,
            supportMessage
        );
        if (sent) {
            setSupportModalVisible(false);
        }
    };

    const handleModalConfirm = async () => {
        if (pixelModalMode === "delete") {
            onConfirmDelete();
        } else if (pixelModalMode === "support") {
            if (!supportFromEmail.trim() || !supportMessage.trim()) {
                playBadMoveSound();
                setPixelModalTitle("On no, gamer!");
                setPixelModalMessage("Please fill in both email and message.");
                setPixelModalButton("Got it");
                setShowPixelModal(true);
                return;
            }
            setSupportConfirmVisible(true);
        }
    };

    const createCheckoutSession = async (userId: string) => {
        const response = await authFetch(
            `/subscription/createCheckoutSession/${userId}`,
            {
                method: "POST",
            }
        );

        return response.url;
    };

    const handleSubscribePress = async () => {
        const userId = await SecureStore.getItemAsync("userId");
        if (!userId) {
            return console.log("No userId found...");
        }
        if (subscription.isSubscribed) {
            setPixelModalTitle("Hey, gamer!");
            setPixelModalMessage("You're already subscribed!");
            setPixelModalButton("Got it");
            setShowPixelModal(true);

            return;
        }
        const url = await createCheckoutSession(userId);
        setSessionUrl(url);
        setModalVisible(true);
    };

    const handleCancelSubscription = async () => {
        const userId = await SecureStore.getItemAsync("userId");
        try {
            const response = await authFetch(`/subscription/cancel/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            console.log(response);

            if (response.success) {
                console.log("Deleted");
                setConfirmationPixelModalTitle("Thanks though, gamer!");
                setConfirmationPixelModalMessage(
                    `Your subscription was cancelled successfully... you have until ${
                        subscription.subscriptionEndDate
                            ? subscription.subscriptionEndDate.toLocaleDateString(
                                  undefined,
                                  {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                  }
                              )
                            : "N/A"
                    } to use your workouts.`
                );

                setConfirmationPixelModalVisible(true);
                playDeleteSound();
                fetchUserData();
            } else {
                setConfirmationPixelModalTitle("Oh no, gamer!");
                setConfirmationPixelModalMessage(
                    "There was an error canceling subscription. Try again later or contact support."
                );
                setConfirmationPixelModalVisible(true);
            }
        } catch (error) {
            setPixelModalTitle("Oh no, gamer!");
            setConfirmationPixelModalMessage(
                "There was an error canceling subscription. Try again later or contact support."
            );
            setConfirmationPixelModalVisible(true);

            console.error(error);
        }
    };

    const onSuccess = async () => {
        try {
            playExcitingSound();
            setModalVisible(false);
            setIsConfirmingSuccessSubscription(true);
            setConfirmationPixelModalTitle("Hey, gamer!");
            setConfirmationPixelModalMessage(
                "Thanks so much! Your subscription was activated successfully. Good luck out there!"
            );
            setConfirmationPixelModalVisible(true);
        } catch (error) {
            console.error(
                "Error refreshing user data after subscription:",
                error
            );
        }
    };

    const onCancel = () => {
        setModalVisible(false);
        playBadMoveSound();
        setConfirmationPixelModalTitle("Hey, gamer!");
        setConfirmationPixelModalMessage(
            "No worries! You can come back at any time to start your gym gamer journey!"
        );
        setConfirmationPixelModalVisible(true);
    };

    return (
        <>
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
                                            disabled={
                                                selectedSystem === "IMPERIAL"
                                            }
                                            containerStyle={{
                                                backgroundColor:
                                                    selectedSystem ===
                                                    "IMPERIAL"
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
                                            disabled={
                                                selectedSystem === "METRIC"
                                            }
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
                                        subscription.isSubscribed
                                            ? "Cancel Subscription"
                                            : "Activate Subscription"
                                    }
                                    onPress={
                                        subscription.isSubscribed
                                            ? handleCancelSubscription
                                            : handleSubscribePress
                                    }
                                    color="#ff0"
                                    containerStyle={styles.button}
                                />

                                {modalVisible && (
                                    <SubscriptionWebView
                                        sessionUrl={sessionUrl!}
                                        onSuccess={onSuccess}
                                        onCancel={onCancel}
                                        onClose={() => setModalVisible(false)}
                                    />
                                )}

                                <PixelButton
                                    text="Contact Support"
                                    onPress={openSupportModal}
                                    color="#00BFFF"
                                    containerStyle={styles.button}
                                />

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
                                        optedIn
                                            ? "Opt Out Of Emails"
                                            : "Opt Into Emails & Offers"
                                    }
                                    onPress={toggleOpt}
                                    color="#9B59B6"
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
                                    text="Contact Support"
                                    onPress={openSupportModal}
                                    color="#00BFFF"
                                    containerStyle={styles.button}
                                />

                                <PixelButton
                                    text="Credits"
                                    onPress={() => {
                                        onClose();
                                        setTimeout(() => {
                                            navigation.navigate(
                                                "CreditsScreen"
                                            );
                                        }, 100);
                                    }}
                                    color="#FF00FF"
                                    containerStyle={styles.button}
                                />

                                <PixelButton
                                    text="Delete Account"
                                    onPress={() => {
                                        setPixelModalTitle("Confirm Delete");
                                        setPixelModalMessage(
                                            "Are you sure you want to delete your account? This cannot be undone."
                                        );
                                        setPixelModalButton("Delete");
                                        setPixelModalMode("delete");
                                        setShowPixelModal(true);
                                    }}
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

                                <PixelModal
                                    visible={showPixelModal}
                                    title={pixelModalTitle}
                                    message={pixelModalMessage}
                                    onConfirm={() => {
                                        handleModalConfirm();
                                        setShowPixelModal(false);
                                    }}
                                    onCancel={() => setShowPixelModal(false)}
                                    confirmText={pixelModalButton}
                                    cancelText="Cancel"
                                />

                                <ConfirmationPixelModal
                                    visible={confirmationPixelModalVisible}
                                    onConfirm={() => {
                                        if (!isConfirmingSucessSubscription) {
                                            setConfirmationPixelModalVisible(
                                                false
                                            );
                                            return;
                                        }
                                        setShowSettings(false);
                                        fetchUserData();
                                        setConfirmationPixelModalVisible(false);
                                        setIsConfirmingSuccessSubscription(
                                            false
                                        );
                                    }}
                                    onCancel={() =>
                                        setConfirmationPixelModalVisible(false)
                                    }
                                    title={confirmationPixelModalTitle}
                                    message={confirmationPixelModalMessage}
                                />

                                <Modal
                                    transparent
                                    visible={supportModalVisible}
                                    animationType="fade"
                                >
                                    <TouchableWithoutFeedback
                                        onPress={closeSupportModal}
                                    >
                                        <View style={styles.overlay}>
                                            <TouchableWithoutFeedback>
                                                <View
                                                    style={[
                                                        styles.modalContainer,
                                                        { maxHeight: "85%" },
                                                    ]}
                                                >
                                                    {!supportConfirmVisible ? (
                                                        <>
                                                            <PixelText
                                                                fontSize={18}
                                                                color="#0ff"
                                                                style={{
                                                                    marginBottom: 10,
                                                                }}
                                                            >
                                                                Contact Support
                                                            </PixelText>

                                                            <PixelText
                                                                fontSize={14}
                                                                color="#fff"
                                                                style={{
                                                                    marginBottom: 6,
                                                                }}
                                                            >
                                                                From Email:
                                                            </PixelText>
                                                            <TextInput
                                                                value={
                                                                    supportFromEmail
                                                                }
                                                                onChangeText={
                                                                    setSupportFromEmail
                                                                }
                                                                keyboardType="email-address"
                                                                autoCapitalize="none"
                                                                style={
                                                                    styles.input
                                                                }
                                                            />

                                                            <PixelText
                                                                fontSize={14}
                                                                color="#fff"
                                                                style={{
                                                                    marginVertical: 6,
                                                                }}
                                                            >
                                                                Message:
                                                            </PixelText>
                                                            <TextInput
                                                                value={
                                                                    supportMessage
                                                                }
                                                                onChangeText={
                                                                    setSupportMessage
                                                                }
                                                                multiline
                                                                numberOfLines={
                                                                    6
                                                                }
                                                                style={[
                                                                    styles.input,
                                                                    {
                                                                        height: 120,
                                                                        textAlignVertical:
                                                                            "top",
                                                                    },
                                                                ]}
                                                            />

                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        "row",
                                                                    justifyContent:
                                                                        "center",
                                                                    marginTop: 15,
                                                                }}
                                                            >
                                                                <PixelButton
                                                                    text="Send"
                                                                    onPress={() => {
                                                                        setPixelModalMode(
                                                                            "support"
                                                                        );
                                                                        handleModalConfirm();
                                                                    }}
                                                                    color="#0f0"
                                                                    containerStyle={{
                                                                        marginHorizontal: 8,
                                                                    }}
                                                                />
                                                                <PixelButton
                                                                    text="Cancel"
                                                                    onPress={
                                                                        closeSupportModal
                                                                    }
                                                                    color="#f00"
                                                                    containerStyle={{
                                                                        marginHorizontal: 8,
                                                                    }}
                                                                />
                                                            </View>
                                                            <ConfirmationPixelModal
                                                                visible={
                                                                    showPixelModal
                                                                }
                                                                title={
                                                                    pixelModalTitle
                                                                }
                                                                message={
                                                                    pixelModalMessage
                                                                }
                                                                onConfirm={() => {
                                                                    setShowPixelModal(
                                                                        false
                                                                    );
                                                                }}
                                                                onCancel={() =>
                                                                    setShowPixelModal(
                                                                        false
                                                                    )
                                                                }
                                                            />
                                                        </>
                                                    ) : (
                                                        // Confirmation screen before sending
                                                        <>
                                                            <PixelText
                                                                fontSize={16}
                                                                color="#fff"
                                                                style={{
                                                                    marginBottom: 12,
                                                                }}
                                                            >
                                                                Please confirm
                                                                sending this
                                                                message:
                                                            </PixelText>

                                                            <PixelText
                                                                fontSize={11}
                                                                color="#0ff"
                                                                style={{
                                                                    marginBottom: 8,
                                                                }}
                                                            >
                                                                From:{" "}
                                                                {
                                                                    supportFromEmail
                                                                }
                                                            </PixelText>

                                                            <PixelText
                                                                fontSize={11}
                                                                color="#fff"
                                                                style={{
                                                                    marginBottom: 12,
                                                                }}
                                                            >
                                                                Message:
                                                            </PixelText>

                                                            <View
                                                                style={{
                                                                    backgroundColor:
                                                                        "#222",
                                                                    padding: 10,
                                                                    borderRadius: 6,
                                                                    maxHeight: 150,
                                                                }}
                                                            >
                                                                <PixelText
                                                                    fontSize={
                                                                        11
                                                                    }
                                                                    color="#fff"
                                                                    style={{
                                                                        flexWrap:
                                                                            "wrap",
                                                                    }}
                                                                >
                                                                    {
                                                                        supportMessage
                                                                    }
                                                                </PixelText>
                                                            </View>

                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        "row",
                                                                    justifyContent:
                                                                        "center",
                                                                    marginTop: 15,
                                                                }}
                                                            >
                                                                <PixelButton
                                                                    text="Confirm"
                                                                    onPress={() =>
                                                                        handleSupportSendPress()
                                                                    }
                                                                    color="#0f0"
                                                                    containerStyle={{
                                                                        marginHorizontal: 8,
                                                                    }}
                                                                />
                                                                <PixelButton
                                                                    text="Cancel"
                                                                    onPress={() =>
                                                                        setSupportConfirmVisible(
                                                                            false
                                                                        )
                                                                    }
                                                                    color="#f00"
                                                                    containerStyle={{
                                                                        marginHorizontal: 8,
                                                                    }}
                                                                />
                                                            </View>
                                                        </>
                                                    )}
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </Modal>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "flex-start",
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
        marginTop: "20%",
    },
    button: {
        borderColor: "#fff",
        marginTop: 10,
    },
    input: {
        backgroundColor: "#222",
        borderColor: "#0ff",
        borderWidth: 1,
        borderRadius: 6,
        color: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 11,
        fontFamily: "PressStart2P_400Regular",
    },
});
