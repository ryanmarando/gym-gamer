import React from "react";
import { View, StyleSheet, ViewStyle, Animated } from "react-native";
import { DimensionValue } from "react-native";

interface ProgressBarProps {
    progress: number | Animated.AnimatedInterpolation<string | number>;
    width?: number | string;
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
    let clampedProgress:
        | number
        | Animated.AnimatedInterpolation<string | number>;
    if (typeof progress === "number") {
        clampedProgress = Math.min(Math.max(progress, 0), 1);
    } else {
        clampedProgress = progress;
    }

    const widthStyle =
        typeof clampedProgress === "number"
            ? (`${clampedProgress * 100}%` as `${number}%`) // <-- assert literal type here
            : clampedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
              });

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
            <Animated.View
                style={{
                    width: widthStyle,
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
