import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import {
    useFonts,
    PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";
import PixelText from "./components/pixelText";
import PixelButton from "./components/pixelButton";

export default function App() {
    let [fontsLoaded] = useFonts({
        PressStart2P_400Regular,
    });

    if (!fontsLoaded) {
        // Just render null or a simple loading view while the font loads
        return null;
    }

    const onPress = () => {
        console.log("Started!");
    };

    return (
        <View style={styles.container}>
            <PixelText>Welcome To Becoming A Gym Gamer!</PixelText>
            <Image
                source={require("./assets/barbell_pixel.png")}
                style={{ width: 64, height: 64 }} // adjust size as needed
                resizeMode="contain" // optional: scales image to fit nicely
            />
            <PixelButton
                text="GET STARTED"
                onPress={onPress}
                color="#F39C12"
                fontSize={22}
                containerStyle={{
                    backgroundColor: "#000",
                    borderColor: "#F39C12",
                    borderWidth: 2,
                }}
            />

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
    },
    pixelText: {
        color: "#0ff",
        fontFamily: "PressStart2P_400Regular",
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: "#222", // dark background
        borderWidth: 3,
        borderColor: "#F39C12", // bright pixel border color (orange)
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 0, // sharp corners for pixel style
        alignItems: "center",
        justifyContent: "center",
        // add pixel-like shadow or glow if you want
        shadowColor: "#F39C12",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 4,
    },
    text: {
        color: "#F39C12",
        fontWeight: "bold",
        fontSize: 18,
        fontFamily: "PressStart2P-Regular", // a classic pixel font you can add via Expo Google Fonts or manually
        letterSpacing: 2,
    },
});
