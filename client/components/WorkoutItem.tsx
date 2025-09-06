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
import { UserWorkoutWithName } from "../types/db";

interface WorkoutItemProps {
    item: UserWorkoutWithName;
    isActive: boolean;
    drag: () => void;
    weightEntries: Record<number, string[]>;
    handleWeightChange: (
        workout_id: number,
        index: number,
        value: string
    ) => void;
    getLastWorkoutWeight: (workout_id: number) => number;
    addEntry: (workout_id: number) => void;
    deleteEntry: (workout_id: number) => void;
    weightSystem: string;
    repEntries: Record<number, string[]>;
    handleRepChange: (workout_id: number, index: number, value: string) => void;
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
    const entryCount = weightEntries[item.workout_id]?.length || 0;
    const lastWeight = getLastWorkoutWeight(item.workout_id);
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
                        {item.name}
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
                            {(weightEntries[item.workout_id] || []).map(
                                (weight, i) => (
                                    <View
                                        key={i}
                                        style={{ alignItems: "center" }}
                                    >
                                        <TextInput
                                            keyboardType="decimal-pad"
                                            onChangeText={(v) =>
                                                handleRepChange(
                                                    item.workout_id,
                                                    i,
                                                    v
                                                )
                                            }
                                            placeholder={(() => {
                                                const defaultRepObj =
                                                    defaultWeights.find(
                                                        (r: any) =>
                                                            r.workout_id ===
                                                            item.workout_id
                                                    );
                                                let rep;
                                                if (defaultRepObj?.reps) {
                                                    try {
                                                        const repsArray =
                                                            JSON.parse(
                                                                defaultRepObj.reps
                                                            );
                                                        rep = repsArray[i];
                                                    } catch {
                                                        rep = undefined;
                                                    }
                                                }

                                                if (
                                                    rep === undefined ||
                                                    rep === "" ||
                                                    rep === 0 ||
                                                    rep === "0"
                                                ) {
                                                    return "Reps";
                                                }

                                                return rep;
                                            })()}
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
                                                    item.workout_id,
                                                    i,
                                                    v
                                                )
                                            }
                                            style={styles.weightInput}
                                            placeholder={(() => {
                                                const defaultWeightObj =
                                                    defaultWeights.find(
                                                        (w: any) =>
                                                            w.workout_id ===
                                                            item.workout_id
                                                    );
                                                let weight;
                                                if (
                                                    defaultWeightObj?.weights_lifted
                                                ) {
                                                    try {
                                                        const weightsArray =
                                                            JSON.parse(
                                                                defaultWeightObj.weights_lifted
                                                            );
                                                        weight =
                                                            weightsArray[i];
                                                    } catch {
                                                        weight = undefined;
                                                    }
                                                }

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
                        onPress={() => addEntry(item.workout_id)}
                        containerStyle={{
                            marginBottom: 8,
                            width: Platform.OS === "ios" ? 40 : undefined,
                        }}
                    />
                    <PixelButton
                        text="-"
                        onPress={() => deleteEntry(item.workout_id)}
                        containerStyle={{
                            width: Platform.OS === "ios" ? 40 : undefined,
                        }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}
