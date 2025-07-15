import React from "react";
import { View, StyleSheet } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export default function Celebration() {
    return (
        <View style={styles.overlay}>
            <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        elevation: 9999,
    },
});
