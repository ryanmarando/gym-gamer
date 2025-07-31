import React, { useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    TextInput,
} from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";
import ConfirmationPixelModal from "./ConfirmationPixelModal";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import { Filter } from "bad-words";
import { playLoginSound } from "../utils/playLoginSound";

interface ResetPasswordFlowModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ResetPasswordModal({
    visible,
    onClose,
}: ResetPasswordFlowModalProps) {
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sentCodeSuccess, setSentCodeSuccess] = useState(false);
    const [finalSuccess, setFinalSuccess] = useState(false);
    const filter = new Filter();
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const handleConfirmAndReset = () => {
        setStep("email");
        setEmail("");
        setCode("");
        setPassword("");
        setConfirmPassword("");
        setMessage("");
    };

    const showError = (msg: string) => {
        setMessage(msg);
        playBadMoveSound();
        setShowConfirmationModal(true);
    };

    // Step 1: Send reset code
    const handleSendCode = async () => {
        if (!email) {
            showError("Please enter your email.");
            return;
        }

        setLoading(true);
        try {
            await fetch(`${API_URL}/auth/requestResetPasswordCode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            setMessage("If that email exists, a code was sent.");
            setSentCodeSuccess(true);
            setShowConfirmationModal(true);
        } catch (error) {
            showError("Failed to send reset code. Try again." + error);
            setSentCodeSuccess(false);
        }
        setLoading(false);
    };

    // Step 2: Submit code + new password
    const handleResetPassword = async () => {
        if (!code) {
            showError("Please enter the reset code.");
            return;
        }
        if (!password || !confirmPassword) {
            showError("Please enter and confirm your new password.");
            return;
        }
        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }
        if (filter.isProfane(password)) {
            showError("Please avoid profanity in your password.");
            return;
        }
        if (password.length < 8 || confirmPassword.length < 8) {
            showError("Passwords is too short.");
            return;
        }

        setLoading(true);
        try {
            await fetch(`${API_URL}/auth/resetPassword`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    resetCode: String(code),
                    newPassword: password,
                }),
            });

            // If no error thrown, it succeeded
            setMessage("Password reset successful!");
            setFinalSuccess(true); // ✅
            setShowConfirmationModal(true);
            playLoginSound();
        } catch (error: any) {
            // error.message contains the server error or thrown error
            showError("Failed to reset password. Try again.");
        }
        setLoading(false);
    };

    const onConfirmPress = () => {
        if (step === "email") handleSendCode();
        else handleResetPassword();
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableWithoutFeedback>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <PixelText
                                fontSize={14}
                                color="#f0f"
                                style={{ marginBottom: 12 }}
                            >
                                {step === "email"
                                    ? "Enter your email"
                                    : "Enter code & new password"}
                            </PixelText>

                            {step === "email" ? (
                                <>
                                    <TextInput
                                        placeholder="Email"
                                        placeholderTextColor="#555"
                                        value={email}
                                        onChangeText={setEmail}
                                        style={styles.input}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </>
                            ) : (
                                <>
                                    <TextInput
                                        placeholder="Reset Code"
                                        placeholderTextColor="#555"
                                        value={code}
                                        onChangeText={setCode}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        placeholder="New Password"
                                        placeholderTextColor="#555"
                                        value={password}
                                        onChangeText={setPassword}
                                        style={[
                                            styles.input,
                                            { marginTop: 10 },
                                        ]}
                                        secureTextEntry
                                    />
                                    <TextInput
                                        placeholder="Confirm Password"
                                        placeholderTextColor="#555"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        style={[
                                            styles.input,
                                            { marginTop: 10 },
                                        ]}
                                        secureTextEntry
                                    />
                                </>
                            )}

                            <View style={styles.buttonRow}>
                                <PixelButton
                                    text="Cancel"
                                    onPress={onClose}
                                    fontSize={12}
                                    color="#f00"
                                    containerStyle={{
                                        flex: 1,
                                        borderColor: "#f00",
                                    }}
                                />
                                <PixelButton
                                    text={
                                        step === "email" ? "Send Code" : "Reset"
                                    }
                                    onPress={onConfirmPress}
                                    fontSize={12}
                                    color="#0f0"
                                    containerStyle={{
                                        flex: 1,
                                        borderColor: "#0f0",
                                    }}
                                    disabled={loading}
                                />
                            </View>

                            <ConfirmationPixelModal
                                visible={showConfirmationModal}
                                title={
                                    message.startsWith("Password reset")
                                        ? "Success!"
                                        : "Whoa there, gamer!"
                                }
                                message={message}
                                onConfirm={() => {
                                    setShowConfirmationModal(false);

                                    if (sentCodeSuccess) {
                                        setStep("code");
                                        setSentCodeSuccess(false);
                                        return;
                                    }

                                    if (finalSuccess) {
                                        // ✅ Wait until modal is fully closed before closing parent
                                        setTimeout(() => {
                                            handleConfirmAndReset();
                                            setFinalSuccess(false);
                                            onClose();
                                        }, 200);
                                    }
                                }}
                                onCancel={() => setShowConfirmationModal(false)}
                            />
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
        width: "90%",
        marginBottom: "50%",
    },
    input: {
        backgroundColor: "#222",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 6,
        color: "#0ff",
        fontFamily: "PressStart2P_400Regular",
        fontSize: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        height: 45,
    },
    buttonRow: {
        marginTop: 20,
        flexDirection: "row",
        gap: 12,
    },
});
