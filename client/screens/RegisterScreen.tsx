import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import PixelModal from "../components/PixelModal";
import WeightSystemSelector from "../components/WeightSystemSelector";
import * as SecureStore from "expo-secure-store";
import { playLoginSound } from "../utils/playLoginSound";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import { SafeAreaView } from "react-native-safe-area-context";
import { openDb } from "../db/db";
import {
    seedAchievements,
    seedQuest,
    seedWorkouts,
    seedWorkoutSplits,
} from "../db/seed";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RegisterScreen({ navigation, setIsLoggedIn }: any) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("Login failed.");
    const [modalTitleMessage, setModalTitleMessage] =
        useState("Whoa there, gamer!");
    const [pendingLogin, setPendingLogin] = useState(false);
    const [waiverAccepted, setWaiverAccepted] = useState(false);
    const [weightSystem, setWeightSystem] = useState<"IMPERIAL" | "METRIC">(
        "IMPERIAL"
    );
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        onConfirm: () => {},
    });
    const [optOutEmails, setOptOutEmails] = useState(false);

    const handleRegisterStart = () => {
        // Check password and confirmed password match
        if (password !== confirmedPassword) {
            console.log("Passwords did not match...");
            setModalMessage("Your passwords did not match...");
            setShowConfirmationModal(true);
            playBadMoveSound();
            return;
        }

        const cleanedEmail = email.replace(/\s+/g, "");
        setEmail(cleanedEmail);

        if (!email || !name || !password || !confirmedPassword) {
            setModalMessage("Please enter all fields...");
            setShowConfirmationModal(true);
            playBadMoveSound();
            return;
        }

        if (!validateEmail(cleanedEmail)) {
            setModalMessage("Please enter a valid email...");
            setShowConfirmationModal(true);
            playBadMoveSound();
            return;
        }

        if (
            email &&
            validateEmail(cleanedEmail) &&
            name &&
            password &&
            confirmedPassword
        ) {
            const message = `Does this look right, gamer?\n\nEmail: ${cleanedEmail}\n\nName: ${name}`;
            setModalConfig({
                title: "Wow, Gamer!",
                message: message,
                onConfirm: () => {
                    handleRegisterPress(cleanedEmail);
                    setModalVisible(false);
                },
            });
            setModalVisible(true);
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Triggered when Register button pressed
    const handleRegisterPress = (cleanedEmail: string) => {
        if (!waiverAccepted) {
            // Navigate to waiver and auto-register if valid
            navigation.navigate("UserWaiver", {
                onAccept: () => {
                    setWaiverAccepted(true);

                    // Auto-register if all info is filled
                    if (cleanedEmail && name && password && confirmedPassword) {
                        handleRegister(cleanedEmail);
                    }
                },
            });
        } else {
            handleRegister(cleanedEmail);
        }
    };

    // Once waiver accepted, user presses Register again to register
    const handleRegister = async (cleanedEmail: string) => {
        // Sign up online for record keeping
        try {
            // Save locally
            const db = await openDb(true);

            const result = await db.runAsync(
                `INSERT INTO users (email, name, weight_system)
               VALUES (?, ?, ?);`,
                [cleanedEmail, name, weightSystem]
            );

            const userId = result.lastInsertRowId;

            await seedWorkouts(db);
            await seedAchievements(db);
            await seedWorkoutSplits(db);
            await seedQuest(db);

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: cleanedEmail,
                    name,
                    password,
                    optedIn: !optOutEmails,
                }),
            });

            if (!response.ok) {
                const data = await response.json();

                // Handle Prisma unique constraint error differently
                if (data.error && data.error.includes("Email")) {
                    throw new Error("Email is already registered.");
                }

                if (data.errors && data.errors.length > 0) {
                    const firstError = data.errors[0];
                    const pathStr =
                        firstError.path && firstError.path[0]
                            ? firstError.path[0]
                            : "Field";
                    const capitalizedPath =
                        pathStr.charAt(0).toUpperCase() + pathStr.slice(1);

                    throw new Error(
                        capitalizedPath +
                            " " +
                            (firstError.message || "Registration failed")
                    );
                } else if (data.message) {
                    throw new Error(data.message);
                } else {
                    throw new Error("Registration failed");
                }
            }

            const data = await response.json();
            const now = new Date().toISOString();
            await SecureStore.setItemAsync("userToken", data.token);
            await SecureStore.setItemAsync("userId", data.user.id.toString());
            await SecureStore.setItemAsync("loginTimestamp", now);

            playLoginSound();
            setModalTitleMessage("Level up!");
            setModalMessage(
                `Congrats gamer ${data.user.name}. You've got a long journey ahead...`
            );
            setPendingLogin(true);
            setShowConfirmationModal(true);
        } catch (error: any) {
            console.log("Error response data:", error);
            playBadMoveSound();
            setModalTitleMessage("Whoa there, gamer!");
            setModalMessage(
                `${error.message}... please enter valid information.`
            );
            setPendingLogin(false);
            setShowConfirmationModal(true);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
            >
                <View style={styles.container}>
                    <PixelText fontSize={20} color="#0ff">
                        Create a Gym Gamer Account
                    </PixelText>

                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        placeholder="Name"
                        placeholderTextColor="#888"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                    />

                    <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="#888"
                        value={confirmedPassword}
                        onChangeText={setConfirmedPassword}
                        style={styles.input}
                        secureTextEntry
                    />

                    <WeightSystemSelector
                        selectedSystem={weightSystem}
                        onSelectSystem={setWeightSystem}
                    />

                    <View style={styles.centeredContainer}>
                        <TouchableWithoutFeedback
                            onPress={() => {
                                setOptOutEmails((prev) => !prev);
                            }}
                        >
                            <View style={styles.checkboxContainer}>
                                <View
                                    style={[
                                        styles.checkbox,
                                        {
                                            backgroundColor: optOutEmails
                                                ? "#0ff"
                                                : "#000",
                                        },
                                    ]}
                                />
                                <PixelText
                                    fontSize={11}
                                    color="#0ff"
                                    style={styles.checkboxText}
                                >
                                    I do not want to receive emails or special
                                    offers.
                                </PixelText>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>

                    <PixelButton
                        text="Register"
                        onPress={handleRegisterStart}
                        color="#0f0"
                        containerStyle={{
                            backgroundColor: waiverAccepted ? "#000" : "#555",
                            borderColor: "#0f0",
                            marginTop: 20,
                        }}
                    />

                    <PixelButton
                        text="Back to Login"
                        onPress={() => navigation.navigate("Login")}
                        color="#f00"
                        containerStyle={{
                            backgroundColor: "#000",
                            borderColor: "#f00",
                            marginTop: 20,
                        }}
                    />

                    <ConfirmationPixelModal
                        visible={showConfirmationModal}
                        onConfirm={() => {
                            setShowConfirmationModal(false);
                            if (pendingLogin) {
                                setPendingLogin(false);
                                setIsLoggedIn(true);
                            }
                        }}
                        onCancel={() => {
                            setShowConfirmationModal(false);
                            if (pendingLogin) {
                                setPendingLogin(false);
                                setIsLoggedIn(true);
                            }
                        }}
                        title={modalTitleMessage}
                        message={modalMessage}
                    />

                    <PixelModal
                        visible={modalVisible}
                        title={modalConfig.title}
                        onConfirm={modalConfig.onConfirm}
                        onCancel={() => setModalVisible(false)}
                    >
                        <PixelText
                            fontSize={11}
                            color="#fff"
                            style={{ textAlign: "center" }}
                        >
                            {modalConfig.message}
                        </PixelText>
                    </PixelModal>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#111" },
    container: {
        flex: 1,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: "5%",
    },
    input: {
        width: "100%",
        borderWidth: 2,
        borderColor: "#0ff",
        borderRadius: 4,
        paddingVertical: 15,
        padding: 10,
        color: "#0ff",
        fontFamily: "PressStart2P_400Regular",
        fontSize: 14,
        marginTop: 20,
        backgroundColor: "#000",
    },
    centeredContainer: {
        width: "80%",
        alignItems: "center",
        marginTop: 20,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: "#0ff",
    },
    checkboxText: {
        textAlign: "center",
    },
});
