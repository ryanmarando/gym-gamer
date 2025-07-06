// screens/WorkoutsScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import PixelText from "../components/PixelText";

export default function WorkoutsScreen() {
    return (
        <View style={styles.container}>
            <PixelText fontSize={20} color="#0ff">
                💪 Workouts Coming Soon!
            </PixelText>
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
