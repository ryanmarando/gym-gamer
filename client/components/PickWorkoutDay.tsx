import React from "react";
import { View, StyleSheet } from "react-native";
import PixelButton from "./PixelButton";
import PixelText from "./PixelText";
import { WorkoutDay } from "../types/db";

interface Props {
    days: WorkoutDay[];
    onSelect: (day: WorkoutDay) => void;
}

export default function PickWorkoutDay({ days, onSelect }: Props) {
    return (
        <View style={styles.container}>
            <PixelText fontSize={18} color="#0ff" style={{ marginBottom: 12 }}>
                Pick your workout day:
            </PixelText>

            {days.map((day) => (
                <PixelButton
                    key={day.id}
                    text={`${day.day_name} Day`}
                    onPress={() => onSelect(day)}
                    containerStyle={styles.dayButton}
                />
            ))}
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
