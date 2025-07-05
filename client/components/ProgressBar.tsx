import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { DimensionValue } from "react-native";

interface ProgressBarProps {
    progress: number; // 0 to 1
    width?: number | string; // number for px or string for %
    height?: number;
    backgroundColor?: string;
    progressColor?: string;
    borderColor?: string;
}

export default function ProgressBar({
    progress,
    width = 200,
    height = 20,
    backgroundColor = "#333",
    progressColor = "#0ff",
    borderColor = "#0ff",
}: ProgressBarProps) {
    // Clamp progress between 0 and 1
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    // Style for container with proper typing
    const containerStyle: ViewStyle = {
        width: width as DimensionValue,
        height,
        backgroundColor,
        borderColor,
        borderWidth: 2,
        borderRadius: 4,
        overflow: "hidden",
    };

    return (
        <View style={containerStyle}>
            <View
                style={{
                    width: `${clampedProgress * 100}%`,
                    height: "100%",
                    backgroundColor: progressColor,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
        overflow: "hidden",
    },
});
