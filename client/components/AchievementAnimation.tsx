import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Text } from "react-native";
import PixelText from "../components/PixelText";

interface AchievementDetails {
    id: number;
    name: string;
    xp: number;
    weeklyReset: boolean;
    description: string;
}

interface AchievementAnimationProps {
    achievement: AchievementDetails;
    onAnimationComplete: () => void;
}

export default function AchievementAnimation({
    achievement,
    onAnimationComplete,
}: AchievementAnimationProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(1500),
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            onAnimationComplete();
        });
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <View style={styles.card}>
                <PixelText fontSize={18} color="#ff0">
                    🎉 Achievement Unlocked!
                </PixelText>
                <PixelText fontSize={16} color="#0ff" style={{ marginTop: 8 }}>
                    {achievement.name}
                </PixelText>
                <PixelText fontSize={12} color="#fff" style={{ marginTop: 4 }}>
                    {achievement.description}
                </PixelText>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: "30%",
        left: "10%",
        right: "10%",
        backgroundColor: "#222",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 8,
        padding: 16,
        zIndex: 1000,
        alignItems: "center",
    },
    card: {
        width: "100%",
        alignItems: "center",
    },
});
