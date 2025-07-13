import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert } from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";
import * as SecureStore from "expo-secure-store";
import { playLoginSound } from "../utils/playLoginSound";

// ⚡️ Use your .env or constants!
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RegisterScreen({ navigation, setIsLoggedIn }: any) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] =
        useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>("Login failed.");
    const [modalTitleMessage, setmodalTitleMessage] =
        useState<string>("Whoa there, gamer!");
    const [pendingLogin, setPendingLogin] = useState(false);

    const handleRegister = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    name,
                    password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Registration failed");
            }

            const data = await response.json();
            console.log("✅ Registration success:", data);

            await SecureStore.setItemAsync("userToken", data.token);
            console.log("🔒 Token saved to SecureStore!");
            await SecureStore.setItemAsync("userId", data.user.id.toString());

            //Alert.alert("Success", "Your account has been created!");
            playLoginSound();
            setmodalTitleMessage("Level up!");
            const message = `Congrats gamer ${data.user.name}. You've got a long journey ahead...`;
            setModalMessage(message);
            setPendingLogin(true);
            setShowConfirmationModal(true);
        } catch (error: any) {
            setmodalTitleMessage("Whoa there, gamer!");
            const message = `${error.message}... please enter valid information.`;
            setModalMessage(message);
            setPendingLogin(false);
            setShowConfirmationModal(true);
        }
    };

    return (
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

            <PixelButton
                text="Register"
                onPress={handleRegister}
                color="#0ff"
                containerStyle={{
                    backgroundColor: "#000",
                    borderColor: "#0ff",
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
                        setIsLoggedIn(true);
                        setPendingLogin(false);
                    }
                }}
                onCancel={() => {
                    setShowConfirmationModal(false);
                    if (pendingLogin) {
                        setIsLoggedIn(true);
                        setPendingLogin(false);
                    }
                }}
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
