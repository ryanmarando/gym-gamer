// screens/HomeScreen.tsx

import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import ProgressBar from "../components/ProgressBar";

export default function HomeScreen({
    navigation,
    isLoggedIn,
    setIsLoggedIn,
}: any) {
    if (!isLoggedIn) {
        return (
            <View style={styles.container}>
                <PixelText fontSize={20} color="#0ff">
                    Welcome to Gym Gamer!
                </PixelText>

                <Image
                    source={require("../assets/barbell_pixel.png")}
                    style={{ width: 64, height: 64 }}
                    resizeMode="contain"
                />

                <PixelButton
                    text="Go to Login"
                    onPress={() => navigation.navigate("Login")}
                    color="#ff0"
                    containerStyle={{
                        backgroundColor: "#000",
                        borderColor: "#ff0",
                        marginTop: 20,
                    }}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PixelText fontSize={20} color="#0ff" style={{ marginBottom: 20 }}>
                🎮 Welcome, Warrior!
            </PixelText>

            <Image
                source={require("../assets/barbell_pixel.png")}
                style={{ width: 100, height: 100, marginBottom: 20 }}
            />

            <PixelText fontSize={12} color="#fff" style={{ marginBottom: 10 }}>
                Level up your gains!
            </PixelText>

            <ProgressBar
                progress={0.75}
                width={250}
                height={15}
                backgroundColor="#222"
                progressColor="#ff0"
                borderColor="#ff0"
            />

            <PixelButton
                text="Log Out"
                onPress={() => setIsLoggedIn(false)}
                color="#f00"
                containerStyle={{
                    backgroundColor: "#000",
                    borderColor: "#f00",
                    marginTop: 20,
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
    },
});
