import React from "react";
import { View, StyleSheet } from "react-native";
import PixelButton from "./PixelButton";
import PixelText from "./PixelText";

interface Props {
    onSelect: (day: "PUSH" | "PULL" | "LEGS") => void;
}

export default function PickWorkoutDay({ onSelect }: Props) {
    return (
        <View style={styles.container}>
            <PixelText fontSize={18} color="#0ff" style={{ marginBottom: 12 }}>
                Pick your workout day:
            </PixelText>

            <PixelButton
                text="Push Day"
                onPress={() => onSelect("PUSH")}
                containerStyle={styles.dayButton}
            />
            <PixelButton
                text="Pull Day"
                onPress={() => onSelect("PULL")}
                containerStyle={styles.dayButton}
            />
            <PixelButton
                text="Legs Day"
                onPress={() => onSelect("LEGS")}
                containerStyle={styles.dayButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
    },
    dayButton: {
        marginVertical: 8,
        width: "80%",
    },
});
