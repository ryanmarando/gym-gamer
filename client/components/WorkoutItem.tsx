import React, { useRef, useEffect } from "react";
import {
    View,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Keyboard,
    Platform,
} from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";
import { styles } from "../screens/WorkoutsScreen";

interface WorkoutItemProps {
    item: any;
    isActive: boolean;
    drag: () => void;
    weightEntries: Record<number, string[]>;
    handleWeightChange: (
        workoutId: number,
        index: number,
        value: string
    ) => void;
    getLastWorkoutWeight: (workoutId: number) => number;
    addEntry: (workoutId: number) => void;
    deleteEntry: (workoutId: number) => void;
    weightSystem: string;
    repEntries: Record<number, string[]>;
    handleRepChange: (workoutId: number, index: number, value: string) => void;
    defaultWeights?: any;
}

export default function WorkoutItem({
    item,
    isActive,
    drag,
    weightEntries,
    handleWeightChange,
    getLastWorkoutWeight,
    addEntry,
    deleteEntry,
    weightSystem,
    repEntries,
    handleRepChange,
    defaultWeights,
}: WorkoutItemProps) {
    const scrollRef = useRef<ScrollView>(null);
    const entryCount = weightEntries[item.workoutId]?.length || 0;
    const lastWeight = getLastWorkoutWeight(item.workoutId);
    const convertedWeight =
        weightSystem === "METRIC" ? lastWeight * 0.453592 : lastWeight;
    const weightPlaceholder = weightSystem === "METRIC" ? "kg" : "lbs";

    useEffect(() => {
        // Whenever the count of entries changes, reset scroll position
        scrollRef.current?.scrollTo({ x: 0, animated: false });
    }, [entryCount]);

    const repsLabel =
        entryCount > 0
            ? ["Reps", ...Array(entryCount - 1).fill("Reps")]
            : ["Reps"];

    function convertLbsToKg(lbs: number): number {
        return lbs / 2.20462;
    }

    function roundToNearestHalf(num: number): number {
        return Math.round(num * 2) / 2;
    }

    return (
        <TouchableOpacity onPress={Keyboard.dismiss} onLongPress={drag}>
            <View style={styles.workoutCard}>
                <View style={{ flex: 1 }}>
                    <PixelText
                        fontSize={14}
                        color="#0f0"
                        style={{ marginBottom: 4, textAlign: "left" }}
                    >
                        {item.workout.name}
                    </PixelText>

                    <PixelText
                        fontSize={10}
                        color="#fff"
                        style={{ marginBottom: 8, textAlign: "left" }}
                    >
                        {lastWeight > 0 ? (
                            <>
                                Max weight:{" "}
                                {weightSystem === "METRIC"
                                    ? `${roundToNearestHalf(
                                          convertLbsToKg(lastWeight)
                                      ).toFixed(1)} kg`
                                    : `${
                                          Number.isInteger(lastWeight)
                                              ? lastWeight
                                              : lastWeight.toFixed(1)
                                      } lbs`}
                            </>
                        ) : (
                            "No weight recorded yet"
                        )}
                    </PixelText>
                    <ScrollView
                        horizontal
                        ref={scrollRef}
                        showsHorizontalScrollIndicator={false}
                    >
                        <View style={{ flexDirection: "row", columnGap: 4 }}>
                            {(weightEntries[item.workoutId] || []).map(
                                (weight, i) => (
                                    <View
                                        key={i}
                                        style={{ alignItems: "center" }}
                                    >
                                        <TextInput
                                            keyboardType="decimal-pad"
                                            value={
                                                repEntries[item.workoutId]?.[
                                                    i
                                                ] || ""
                                            }
                                            onChangeText={(v) =>
                                                handleRepChange(
                                                    item.workoutId,
                                                    i,
                                                    v
                                                )
                                            }
                                            placeholder={repsLabel[i] ?? "0"}
                                            placeholderTextColor="#ccc"
                                            style={{
                                                fontSize: 13,
                                                color: "#fff",
                                                textAlign: "center",
                                                padding: 7,
                                                marginBottom: 5,
                                                borderWidth: 1,
                                                borderColor: "#0f0",
                                                borderRadius: 6,
                                                backgroundColor:
                                                    "rgba(0, 255, 0, 0.1)",

                                                textAlignVertical: "center",
                                                fontFamily:
                                                    "PressStart2P_400Regular",
                                            }}
                                        />

                                        <TextInput
                                            keyboardType="decimal-pad"
                                            onChangeText={(v) =>
                                                handleWeightChange(
                                                    item.workoutId,
                                                    i,
                                                    v
                                                )
                                            }
                                            style={styles.weightInput}
                                            placeholder={(() => {
                                                const defaultWeightObj =
                                                    defaultWeights.find(
                                                        (w: any) =>
                                                            w.workoutId ===
                                                            item.workoutId
                                                    );
                                                const weight =
                                                    defaultWeightObj
                                                        ?.weightsLifted?.[i];

                                                // If weight is undefined, empty string, or 0 (number or string), use the placeholder
                                                if (
                                                    weight === undefined ||
                                                    weight === "" ||
                                                    weight === 0 ||
                                                    weight === "0"
                                                ) {
                                                    return weightPlaceholder;
                                                }

                                                return weight;
                                            })()}
                                            placeholderTextColor="#555"
                                        />
                                    </View>
                                )
                            )}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.buttonsColumn}>
                    <PixelButton
                        text="+"
                        onPress={() => addEntry(item.workoutId)}
                        containerStyle={{
                            marginBottom: 8,
                            width: Platform.OS === "ios" ? 40 : undefined,
                        }}
                    />
                    <PixelButton
                        text="-"
                        onPress={() => deleteEntry(item.workoutId)}
                        containerStyle={{
                            width: Platform.OS === "ios" ? 40 : undefined,
                        }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}
