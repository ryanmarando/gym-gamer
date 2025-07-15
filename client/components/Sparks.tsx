import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";

interface SparksProps {
    active: boolean; // whether sparks animate or not
}

const SPARK_COUNT = 10;

export default function Sparks({ active }: SparksProps) {
    const sparks = useRef(
        [...Array(SPARK_COUNT)].map(() => ({
            translateY: new Animated.Value(0),
            scale: new Animated.Value(0),
            opacity: new Animated.Value(1),
        }))
    ).current;

    useEffect(() => {
        if (!active) {
            // Reset sparks when inactive
            sparks.forEach(({ translateY, scale, opacity }) => {
                translateY.setValue(0);
                scale.setValue(0);
                opacity.setValue(1);
            });
            return;
        }

        // Create the animation sequence for each spark
        const animations = sparks.map(({ translateY, scale, opacity }, i) => {
            return Animated.sequence([
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -30 - i * 5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(scale, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.delay(i * 0.1),
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ]);
        });

        // Loop the animations forever with stagger
        const looped = Animated.loop(Animated.stagger(100, animations));
        looped.start();

        // Cleanup on unmount or active = false
        return () => {
            looped.stop();
            sparks.forEach(({ translateY, scale, opacity }) => {
                translateY.setValue(0);
                scale.setValue(0);
                opacity.setValue(1);
            });
        };
    }, [active]);

    return (
        <View style={styles.sparkContainer} pointerEvents="none">
            {sparks.map(({ translateY, scale, opacity }, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.spark,
                        {
                            transform: [{ translateY }, { scale }],
                            opacity,
                            left: 20 * i, // horizontal spacing
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    sparkContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        flexDirection: "row",
    },
    spark: {
        position: "absolute",
        width: 10,
        height: 10,
        backgroundColor: "#fff",
        borderRadius: 5,
    },
});
