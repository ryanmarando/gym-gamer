import Reac, { useState } from "react";
import { View, StyleSheet, TextInput, Alert } from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function LoginScreen({ navigation, setIsLoggedIn }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

            Alert.alert("Success", "You are logged in!");

            // Set login state true here
            setIsLoggedIn(true);

            // Navigate back to home
            navigation.navigate("Home");
        } catch (error: any) {
            console.error("❌ Login error:", error);
            Alert.alert("Login Failed", error.message);
        }
    };

    return (
        <View style={styles.container}>
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
                text="Back to Home"
                onPress={() => navigation.navigate("Home")}
                color="#0ff"
                containerStyle={{
                    backgroundColor: "#000",
                    borderColor: "#0ff",
                    marginTop: 10,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
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
