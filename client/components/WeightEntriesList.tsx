import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import PixelText from "../components/PixelText";

type WeightEntry = {
    id: number;
    userId: number;
    weight: number;
    enteredAt: string;
};

type Props = {
    weights: WeightEntry[];
    weightSystem: "IMPERIAL" | "METRIC";
};

export default function WeightEntriesList({ weights, weightSystem }: Props) {
    // Sort descending by date
    const sortedWeights = [...weights].sort(
        (a, b) =>
            new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime()
    );

    const unit = weightSystem === "METRIC" ? "kg" : "lbs";

    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
        >
            {sortedWeights.map((item) => {
                const dateStr = new Date(item.enteredAt).toLocaleDateString();
                const timeStr = new Date(item.enteredAt).toLocaleTimeString();

                return (
                    <View key={item.id} style={styles.entryContainer}>
                        <PixelText fontSize={12} color="#0ff">
                            {dateStr} {timeStr}
                        </PixelText>
                        <PixelText fontSize={14} color="#0f0">
                            {item.weight} {unit}
                        </PixelText>
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    entryContainer: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#0ff",
    },
});
