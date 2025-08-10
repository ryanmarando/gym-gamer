import React from "react";
import {
    View,
    SafeAreaView,
    StyleSheet,
    Linking,
    ScrollView,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";

export default function CreditsScreen({ navigation }: any) {
    const soundCredits = [
        {
            title: '"Powerup2.wav"',
            author: "AbbasGamez",
            url: "https://freesound.org/s/411443/",
            license: "CC0",
        },
        {
            title: '"8-Bit Arcade Video Game Start Sound Effect, Gun Reload and Jump !!"',
            author: "FartBiscuit1700",
            url: "https://freesound.org/s/368691/",
            license: "CC0",
        },
        {
            title: '"8-Bit Powerup"',
            author: "SomeGuy22",
            url: "https://freesound.org/s/431329/",
            license: "CC0",
        },
        {
            title: '"Pixel Sound Effect #3"',
            author: "hmmm101",
            url: "https://freesound.org/s/340003/",
            license: "CC0",
        },
        {
            title: '"Back SFX"',
            author: "jhyland",
            url: "https://freesound.org/s/539672/",
            license: "CC0",
        },
        {
            title: '"8bit-style bonus effect"',
            author: "complex_waveform",
            url: "https://freesound.org/s/213149/",
            license: "CC BY 4.0",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        },
        {
            title: '"Alert! alert! alert!"',
            author: "AceOfSpadesProduc100",
            url: "https://freesound.org/s/337257/",
            license: "CC BY 4.0",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        },
        {
            title: '"UI Completed Status Alert Notification SFX001.wav"',
            author: "Headphaze",
            url: "https://freesound.org/s/277033/",
            license: "CC BY 4.0",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        },
        {
            title: '"SW001_8-Bit-Games_Music_Element_Fail_01_Arp.wav"',
            author: "shapingwaves",
            url: "https://freesound.org/s/362375/",
            license: "CC BY 4.0",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <PixelText fontSize={18} color="#0ff" style={styles.title}>
                    Sound Credits
                </PixelText>

                {soundCredits.map((sound, index) => (
                    <View key={index} style={{ marginBottom: 16 }}>
                        <PixelText
                            fontSize={13}
                            color="#fff"
                            style={styles.text}
                        >
                            {sound.title} by {sound.author}
                        </PixelText>
                        <PixelButton
                            text="View on Freesound"
                            onPress={() => Linking.openURL(sound.url)}
                            color="#FFA500"
                            containerStyle={styles.button}
                        />
                        {sound.license === "CC BY 4.0" && sound.licenseUrl && (
                            <PixelButton
                                text="View License Info"
                                onPress={() =>
                                    Linking.openURL(sound.licenseUrl)
                                }
                                color="#7CFC00"
                                containerStyle={styles.button}
                            />
                        )}
                    </View>
                ))}
            </ScrollView>
            <View style={styles.bottomButtonContainer}>
                <PixelButton
                    text="Back to Profile"
                    color="rgba(200, 0, 255, 1)"
                    onPress={() => navigation.goBack()}
                    containerStyle={{ paddingHorizontal: 20 }}
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
        padding: 20,
        backgroundColor: "#111",
        flexGrow: 1,
    },
    title: {
        marginBottom: 20,
    },
    text: {
        marginBottom: 6,
    },
    button: {
        borderColor: "#fff",
        marginBottom: 14,
    },
    bottomButtonContainer: {
        padding: 12,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
});
