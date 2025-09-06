import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import PixelText from "../components/PixelText";
import { UserWeightEntry } from "../types/db";

type Props = {
    weights: UserWeightEntry[];
    weightSystem: "IMPERIAL" | "METRIC";
};

export default function WeightEntriesList({ weights, weightSystem }: Props) {
    // Sort descending by date
    const sortedWeights = [...weights].sort(
        (a, b) =>
            new Date(b.entered_at).getTime() - new Date(a.entered_at).getTime()
    );

    const unit = weightSystem === "METRIC" ? "kg" : "lbs";
    const convertToKg = (lbs: number) => lbs / 2.20462;
    const roundToNearestHalf = (num: number) => Math.round(num * 2) / 2;

    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
        >
            {sortedWeights.map((item) => {
                const dateStr = new Date(item.entered_at).toLocaleDateString();
                const timeStr = new Date(item.entered_at).toLocaleTimeString();

                return (
                    <View key={item.id} style={styles.entryContainer}>
                        <PixelText fontSize={12} color="#0ff">
                            {dateStr} {timeStr}
                        </PixelText>
                        <PixelText fontSize={14} color="#0f0">
                            {weightSystem === "METRIC"
                                ? `${roundToNearestHalf(
                                      convertToKg(item.weight)
                                  )} kg`
                                : `${roundToNearestHalf(item.weight)} lbs`}
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
