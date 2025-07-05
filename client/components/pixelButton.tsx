import React from "react";
import {
    TouchableOpacity,
    TouchableOpacityProps,
    StyleSheet,
    ViewStyle,
} from "react-native";
import PixelText from "./pixelText";

interface PixelButtonProps extends TouchableOpacityProps {
    text: string;
    color?: string;
    fontSize?: number;
    textAlign?: "center" | "left" | "right";
    paddingHorizontal?: number;
    containerStyle?: ViewStyle;
}

export default function PixelButton({
    text,
    onPress,
    color = "#0ff",
    fontSize = 14,
    textAlign = "center",
    paddingHorizontal,
    containerStyle,
    ...rest
}: PixelButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.buttonContainer, containerStyle]}
            activeOpacity={0.8}
            {...rest}
        >
            <PixelText
                color={color}
                fontSize={fontSize}
                textAlign={textAlign}
                paddingHorizontal={paddingHorizontal}
            >
                {text}
            </PixelText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: "#222", // or your pixel art button bg
        borderColor: "#0ff",
        borderWidth: 2,
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: "center",
    },
});
