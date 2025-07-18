// components/PixelText.tsx
import React from "react";
import { Text, TextProps, StyleSheet, TextStyle } from "react-native";

interface PixelTextProps extends TextProps {
    color?: string;
    fontSize?: number;
    textAlign?: TextStyle["textAlign"];
    paddingHorizontal?: number;
}

export default function PixelText({
    color,
    fontSize,
    textAlign,
    paddingHorizontal,
    style,
    ...rest
}: PixelTextProps) {
    return (
        <Text
            {...rest}
            style={[
                styles.text,

                color != null ? { color } : undefined,
                typeof fontSize === "number" ? { fontSize } : undefined,
                textAlign != null ? { textAlign } : undefined,
                typeof paddingHorizontal === "number"
                    ? { paddingHorizontal }
                    : undefined,
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    text: {
        fontFamily: "PressStart2P_400Regular",
        color: "#0ff",
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 20,
        flexWrap: "wrap",
        overflow: "hidden",
    },
});
