import React, { useState } from "react";
import { Modal, ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

interface SubscriptionWebViewProps {
    sessionUrl: string;
    onSuccess: () => void;
    onCancel: () => void;
    onClose: () => void;
}

export default function SubscriptionWebView({
    sessionUrl,
    onSuccess,
    onCancel,
    onClose,
}: SubscriptionWebViewProps) {
    const [loading, setLoading] = useState(true);

    const handleNavigationChange = (navState: WebViewNavigation) => {
        const url = navState.url;

        const successUrl = "https://www.gymgamer.fit/subscription-success";
        const cancelUrl = "https://www.gymgamer.fit/subscription-cancel";

        if (url.startsWith(successUrl)) {
            onSuccess();
            onClose();
            return false;
        } else if (url.startsWith(cancelUrl)) {
            onCancel();
            onClose();
            return false;
        }
        return true;
    };

    return (
        <Modal visible onRequestClose={onClose} animationType="slide">
            <View style={{ flex: 1, marginTop: 40, backgroundColor: "#111" }}>
                {loading && (
                    <ActivityIndicator size="large" style={styles.loader} />
                )}
                <WebView
                    source={{ uri: sessionUrl }}
                    onLoadEnd={() => setLoading(false)}
                    onNavigationStateChange={handleNavigationChange}
                    startInLoadingState
                    style={{ flex: 1 }}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
