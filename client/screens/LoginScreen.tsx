import React, { useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    Image,
    ActivityIndicator,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import { playLoginSound } from "../utils/playLoginSound";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen({ navigation, setIsLoggedIn }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("Login failed.");
    const [modalTitleMessage, setModalTitleMessage] =
        useState("Whoa there, gamer!");
    const [loading, setLoading] = useState(false); // New loading state

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            playBadMoveSound();
            setModalMessage("Please enter both email and password.");
            setModalTitleMessage("Oops!");
            setShowConfirmationModal(true);
            return; // stop further execution
        }
        setLoading(true); // Start loading
        try {
            const response = await fetch(API_URL + "/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await response.json();
            console.log("✅ Login success:", data);

            await SecureStore.setItemAsync("userToken", data.token);
            await SecureStore.setItemAsync("userId", data.user.id.toString());

            setIsLoggedIn(true);
            playLoginSound();
        } catch (error: any) {
            playBadMoveSound();
            const message = `Login failed: ${error.message}`;
            setModalMessage(message);
            setShowConfirmationModal(true);
        } finally {
            setLoading(false); // Stop loading in all cases
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <PixelText fontSize={20} color="#ff0">
                    Welcome to Gym Gamer!
                </PixelText>

                <Image
                    source={require("../assets/barbell_pixel.png")}
                    style={{ width: 64, height: 64 }}
                    resizeMode="contain"
                />

                <PixelText fontSize={20} color="#0ff">
                    Log In to Continue
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
                    placeholder="Password"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color="#0ff"
                        style={{ marginTop: 20 }}
                    />
                ) : (
                    <PixelButton
                        text="Log In"
                        onPress={handleLogin}
                        color="#0ff"
                        containerStyle={{
                            backgroundColor: "#000",
                            borderColor: "#0ff",
                            marginTop: 20,
                        }}
                        disabled={loading} // disable button when loading
                    />
                )}

                <PixelButton
                    text="Sign Up"
                    onPress={() => navigation.navigate("Register")}
                    color="#f00"
                    containerStyle={{
                        backgroundColor: "#000",
                        borderColor: "#f00",
                        marginTop: 20,
                    }}
                />

                <ConfirmationPixelModal
                    visible={showConfirmationModal}
                    onConfirm={() => setShowConfirmationModal(false)}
                    onCancel={() => setShowConfirmationModal(false)}
                    title={modalTitleMessage}
                    message={modalMessage}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111",
    },
    container: {
        flex: 1,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: "5%",
        paddingVertical: "10%",
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
});
