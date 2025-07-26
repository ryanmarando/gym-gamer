import React from "react";
import {
    Pressable,
    StyleSheet,
    ViewStyle,
    GestureResponderEvent,
    PressableProps,
} from "react-native";
import PixelText from "./PixelText";
import { playPixelSound } from "../utils/playPixelSound";

interface PixelButtonProps extends PressableProps {
    text?: string;
    color?: string;
    fontSize?: number;
    textAlign?: "center" | "left" | "right";
    paddingHorizontal?: number;
    containerStyle?: ViewStyle | ViewStyle[];
    playSound?: boolean;
    children?: React.ReactNode;
}

export default function PixelButton({
    text,
    onPress,
    color = "#0ff",
    fontSize = 14,
    textAlign = "center",
    paddingHorizontal,
    containerStyle,
    playSound = true,
    children,
    ...rest
}: PixelButtonProps) {
    const handlePress = (event: GestureResponderEvent) => {
        if (playSound) playPixelSound();
        if (onPress) onPress(event);
    };

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.buttonContainer,
                containerStyle,
                pressed && { transform: [{ scale: 0.95 }], opacity: 0.7 },
            ]}
            {...rest}
        >
            {children ? (
                children
            ) : (
                <PixelText
                    color={color}
                    fontSize={fontSize}
                    textAlign={textAlign}
                    paddingHorizontal={paddingHorizontal}
                >
                    {text}
                </PixelText>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: "#222",
        borderWidth: 2,
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: "center",
    },
});
