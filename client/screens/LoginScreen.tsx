import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Image } from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import { playLoginSound } from "../utils/playLoginSound";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen({ navigation, setIsLoggedIn }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] =
        useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>("Login failed.");
    const [modalTitleMessage, setmodalTitleMessage] =
        useState<string>("Whoa there, gamer!");

    const handleLogin = async () => {
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

            // Save user data
            await SecureStore.setItemAsync("userToken", data.token);
            console.log("🔒 Token saved to SecureStore!");
            await SecureStore.setItemAsync("userId", data.user.id.toString());

            setIsLoggedIn(true);
            playLoginSound();

            // Set login state true here
        } catch (error: any) {
            setShowConfirmationModal(true);
            const message = `Login failed: ${error.message}`;
            setModalMessage(message);
        }
    };

    return (
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

            <PixelButton
                text="Log In"
                onPress={handleLogin}
                color="#0ff"
                containerStyle={{
                    backgroundColor: "#000",
                    borderColor: "#0ff",
                    marginTop: 20,
                }}
            />

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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: "5%",
        paddingVertical: "20%",
    },
    input: {
        width: "100%",
        borderWidth: 2,
        borderColor: "#0ff",
        borderRadius: 4,
        padding: 10,
        color: "#0ff",
        fontFamily: "PressStart2P_400Regular",
        fontSize: 10,
        marginTop: 20,
        backgroundColor: "#000",
    },
});
