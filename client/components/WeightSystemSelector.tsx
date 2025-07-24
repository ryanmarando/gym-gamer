import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import PixelText from "./PixelText";
import { playPixelSound } from "../utils/playPixelSound";

interface Props {
    selectedSystem: "IMPERIAL" | "METRIC";
    onSelectSystem: (system: "IMPERIAL" | "METRIC") => void;
}

export default function WeightSystemSelector({
    selectedSystem,
    onSelectSystem,
}: Props) {
    return (
        <View style={styles.selectorContainer}>
            {["IMPERIAL", "METRIC"].map((system: any) => (
                <TouchableOpacity
                    key={system}
                    style={[
                        styles.button,
                        selectedSystem === system && styles.buttonSelected,
                    ]}
                    onPress={() => {
                        onSelectSystem(system);
                        playPixelSound();
                    }}
                >
                    <PixelText
                        style={[
                            styles.buttonText,
                            selectedSystem === system &&
                                styles.buttonTextSelected,
                        ]}
                    >
                        {system === "IMPERIAL"
                            ? "Imperial (lbs)"
                            : "Metric (kg)"}
                    </PixelText>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    selectorContainer: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: "#0ff",
        borderRadius: 8,
        alignItems: "center",
    },
    buttonSelected: {
        backgroundColor: "#0ff",
    },
    buttonText: {
        fontSize: 10,
        color: "#0ff",
    },
    buttonTextSelected: {
        color: "#000",
    },
});
