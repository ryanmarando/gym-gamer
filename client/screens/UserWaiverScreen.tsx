import React from "react";
import { ScrollView, StyleSheet, View, SafeAreaView } from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";

export default function UserWaiverScreen({ navigation, route }: any) {
    const { onAccept } = route.params;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <PixelText fontSize={25} style={{ paddingBottom: 10 }}>
                        Gym Gamer User Agreement
                    </PixelText>
                    <PixelText fontSize={14} color="#fff" style={styles.text}>
                        By using this app, you acknowledge and agree that:
                        {"\n\n"}1. This app provides general fitness information
                        and is not a substitute for professional medical advice,
                        diagnosis, or treatment.
                        {"\n\n"}2. You should consult a healthcare professional
                        before starting any exercise program, especially if you
                        have any pre-existing conditions or concerns.
                        {"\n\n"}3. Participation in physical activities involves
                        risk of injury. You accept full responsibility for your
                        own safety and assume all risks.
                        {"\n\n"}4. The app creators and developers are not
                        liable for any injuries, losses, or damages arising from
                        your use of this app.
                        {"\n\n"}5. Use this app at your own risk.
                        {"\n\n"}If you do not agree to these terms, please
                        discontinue use of the app immediately.
                    </PixelText>
                </ScrollView>

                <PixelButton
                    text="I Agree"
                    color="#ff0"
                    onPress={() => {
                        onAccept();
                        navigation.goBack();
                    }}
                    containerStyle={styles.button}
                />
                <PixelButton
                    text="Cancel"
                    color="#000"
                    onPress={() => navigation.goBack()}
                    containerStyle={styles.button}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#111" },
    container: {
        flex: 1,
        backgroundColor: "#111",
        padding: 20,
        justifyContent: "space-between",
    },
    scrollView: {
        flex: 1,
        marginBottom: 20,
    },
    text: {
        lineHeight: 22,
    },
    button: {
        backgroundColor: "#0ff",
        marginBottom: 10,
    },
});
