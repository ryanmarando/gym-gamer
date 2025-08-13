import React, { useEffect, useRef, useState } from "react";
import {
    SafeAreaView,
    View,
    StyleSheet,
    Image,
    Text,
    Animated,
    TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import PixelButton from "../components/PixelButton";
import PixelText from "../components/PixelText";
import { Dimensions } from "react-native";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";

const PIXEL_CONFETTI_COUNT = 50;

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function PixelConfetti() {
    const animY = useRef(new Animated.Value(0)).current;
    const [size] = useState(randomInt(8, 14));
    const [delay] = useState(randomInt(0, 5000));
    const screenWidth = Dimensions.get("window").width;
    const leftPx = useRef(randomInt(0, screenWidth - size)).current;
    const leftPercent = (leftPx / screenWidth) * 100;
    const colors = ["#0ff", "#ff0", "#f0f", "#0f0", "#f00", "#00f"];
    const color = useRef(colors[randomInt(0, colors.length - 1)]).current;
    const screenHeight = Dimensions.get("window").height;

    useEffect(() => {
        const loopAnimation = () => {
            animY.setValue(-size);
            Animated.timing(animY, {
                toValue: screenHeight + size,
                duration: randomInt(5000, 9000),
                delay,
                useNativeDriver: true,
            }).start(() => {
                loopAnimation();
            });
        };
        loopAnimation();
    }, [animY, delay, size]);

    return (
        <Animated.View
            style={{
                position: "absolute",
                top: -50,
                left: `${leftPercent}%`,
                width: size,
                height: size,
                backgroundColor: color,
                opacity: 0.8,
                borderRadius: 1,
                transform: [{ translateY: animY }],
            }}
        />
    );
}

export default function SubscriptionScreen({
    navigation,
}: {
    navigation: any;
}) {
    const sound = useRef<Audio.Sound | null>(null);
    const price = "$1.99 / month";
    const userName = "Gamer";
    const appLogo = require("../assets/gym-gamer-app-icon.png");
    const musicUri = require("../assets/sounds/pixel_adventure_music.wav");

    async function onSubscribe() {
        const userId = await SecureStore.getItemAsync("userId");
        try {
            console.log("Subscribing...");
            const data = await authFetch(`/subscription/toggle/${userId}`, {
                method: "PATCH",
            });

            console.log("Subscription toggled:", data);
        } catch (error) {
            console.error("Error subscribing:", error);
        }
    }

    useEffect(() => {
        async function loadSound() {
            if (!musicUri) return;
            try {
                let source: any;
                if (
                    typeof musicUri === "string" &&
                    musicUri.startsWith("http")
                ) {
                    source = { uri: musicUri };
                } else {
                    source = musicUri;
                }
                const { sound: s } = await Audio.Sound.createAsync(source, {
                    isLooping: true,
                    volume: 0.05,
                });
                sound.current = s;
                await s.playAsync();
                console.log("Playing sound...");
            } catch (error) {
                console.error("Error loading or playing sound:", error);
            }
        }
        loadSound();

        return () => {
            if (sound.current) {
                sound.current.unloadAsync();
            }
        };
    }, [musicUri]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Pixel confetti background */}
                {[...Array(PIXEL_CONFETTI_COUNT)].map((_, i) => (
                    <PixelConfetti key={i} />
                ))}

                {/* Main content */}
                <View style={styles.content}>
                    {/* App Logo */}
                    <Image
                        source={appLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Welcome text */}
                    <PixelText
                        fontSize={26}
                        color="#0ff"
                        style={{ marginBottom: 16 }}
                    >
                        Ready to Level Up, {userName}?
                    </PixelText>

                    {/* Price display */}
                    <PixelText
                        fontSize={20}
                        color="#ff0"
                        style={{ marginBottom: 24 }}
                    >
                        Unlock Workout Access for{" "}
                        <Text style={{ fontWeight: "bold" }}>{price}</Text>
                    </PixelText>

                    {/* Subscribe button */}
                    <PixelButton
                        text="Subscribe Now"
                        color="#0ff"
                        containerStyle={styles.subscribeButton}
                        onPress={onSubscribe}
                        playSound={true}
                    />

                    {/* Cancel/Back button */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginTop: 24 }}
                    >
                        <PixelText fontSize={14} color="#888">
                            Not now, maybe later
                        </PixelText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111",
    },
    container: {
        flex: 1,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        paddingHorizontal: 20,
    },
    content: {
        alignItems: "center",
        zIndex: 10,
        width: "100%",
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    subscribeButton: {
        width: 220,
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 12,
    },
});
