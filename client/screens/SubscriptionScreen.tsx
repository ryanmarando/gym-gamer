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
import PixelModal from "../components/PixelModal";
import { playDeleteSound } from "../utils/playDeleteSound";
import { playCompleteSound } from "../utils/playCompleteSound";
import { Dimensions } from "react-native";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import ConfirmationPixelModal from "../components/ConfirmationPixelModal";

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
    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
    const [name, setName] = useState<string>();
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<
        string | null
    >(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showThanksModal, setShowThanksModal] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const price = "$1.99 / month";
    const userName = "Gamer";
    const appLogo = require("../assets/gym-gamer-app-icon.png");
    const musicUri = require("../assets/sounds/pixel_adventure_music.wav");

    function formatDate(dateString: string) {
        try {
            const date = new Date(dateString);
            return date.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    }

    async function loadSubscriptionStatus() {
        try {
            const userId = await SecureStore.getItemAsync("userId");
            if (!userId) return;
            const data = await authFetch(`/user/${userId}`);
            setIsSubscribed(Boolean(data?.isSubscribed));
            setName(data?.name);
            if (data?.subscriptionEndDate) {
                setSubscriptionEndDate(data.subscriptionEndDate);
            }
        } catch (err) {
            console.error("Failed to load subscription status:", err);
        }
    }

    async function toggleSubscription() {
        try {
            const userId = await SecureStore.getItemAsync("userId");
            if (!userId) return;
            const data = await authFetch(`/subscription/toggle/${userId}`, {
                method: "PATCH",
            });

            // Always store updated status
            const newStatus = Boolean(data?.isSubscribed);

            // If they just subscribed, show thanks modal
            if (newStatus) {
                setShowThanksModal(true);
                playCompleteSound();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 4800);
                return;
            }
            setIsSubscribed(newStatus);
        } catch (err) {
            console.error("Error toggling subscription:", err);
        }
    }

    useEffect(() => {
        loadSubscriptionStatus();
    }, []);

    useEffect(() => {
        if (isSubscribed === false) {
            async function loadSound() {
                if (!musicUri) return;
                try {
                    let source: any =
                        typeof musicUri === "string" &&
                        musicUri.startsWith("http")
                            ? { uri: musicUri }
                            : musicUri;
                    const { sound: s } = await Audio.Sound.createAsync(source, {
                        isLooping: true,
                        volume: 0.05,
                    });
                    sound.current = s;
                    await s.playAsync();
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
        }
    }, [musicUri, isSubscribed]);

    if (isSubscribed === null) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <PixelText fontSize={18} color="#fff">
                        Loading...
                    </PixelText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {isSubscribed === false && (
                    <>
                        {[...Array(PIXEL_CONFETTI_COUNT)].map((_, i) => (
                            <PixelConfetti key={i} />
                        ))}
                        <View style={styles.content}>
                            <Image
                                source={appLogo}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <PixelText
                                fontSize={26}
                                color="#0ff"
                                style={{ marginBottom: 16 }}
                            >
                                Ready to Level Up, {name}?
                            </PixelText>
                            <PixelText
                                fontSize={20}
                                color="#ff0"
                                style={{ marginBottom: 24 }}
                            >
                                Unlock Workout Access for{" "}
                                <Text style={{ fontWeight: "bold" }}>
                                    {price}
                                </Text>
                            </PixelText>
                            <PixelButton
                                text="Subscribe Now"
                                color="#0ff"
                                containerStyle={styles.subscribeButton}
                                onPress={toggleSubscription}
                                playSound={true}
                            />
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ marginTop: 24 }}
                            >
                                <PixelText fontSize={14} color="#888">
                                    Not now, maybe later
                                </PixelText>
                            </TouchableOpacity>
                            <ConfirmationPixelModal
                                visible={showThanksModal}
                                title="🎉 Big Thanks!"
                                message={`Thanks for subscribing, ${userName}! Enjoy your unlimited workouts.`}
                                onCancel={() => {
                                    setShowThanksModal(false);
                                    setIsSubscribed(true);
                                    navigation.goBack();
                                }}
                                onConfirm={() => {
                                    setShowThanksModal(false);
                                    setIsSubscribed(true);
                                    navigation.goBack();
                                }}
                                confettiVisible={showConfetti}
                            />
                        </View>
                    </>
                )}

                {isSubscribed === true && (
                    <View style={styles.content}>
                        <Image
                            source={appLogo}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <PixelText
                            fontSize={26}
                            color="#0ff"
                            style={{ marginBottom: 16 }}
                        >
                            You’re Subscribed, {userName}!
                        </PixelText>
                        <PixelText
                            fontSize={16}
                            color="#ff0"
                            style={{ marginBottom: 24 }}
                        >
                            Enjoy your workouts anytime.
                        </PixelText>
                        <PixelButton
                            text="Cancel Subscription"
                            color="#f00"
                            containerStyle={styles.subscribeButton}
                            onPress={() => setShowCancelModal(true)}
                        />
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ marginTop: 24 }}
                        >
                            <PixelText fontSize={14} color="#888">
                                Back
                            </PixelText>
                        </TouchableOpacity>
                    </View>
                )}

                <PixelModal
                    visible={showCancelModal}
                    onCancel={() => setShowCancelModal(false)}
                    title="Cancel Subscription?"
                    message={
                        `Are you sure you want to cancel? ` +
                        (subscriptionEndDate
                            ? `You'll still have unlimited access until ${formatDate(
                                  subscriptionEndDate
                              )}.`
                            : "")
                    }
                    onConfirm={() => {
                        toggleSubscription();
                        playDeleteSound();
                        navigation.goBack();
                    }}
                />
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
