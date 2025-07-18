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
}: WorkoutItemProps) {
    const scrollRef = useRef<ScrollView>(null);
    const entryCount = weightEntries[item.workoutId]?.length || 0;

    useEffect(() => {
        // Whenever the count of entries changes, reset scroll position
        scrollRef.current?.scrollTo({ x: 0, animated: false });
    }, [entryCount]);

    const repsLabel =
        entryCount > 0
            ? ["10", ...Array(entryCount - 1).fill("Failure")]
            : ["10"];

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
                        Max weight: {getLastWorkoutWeight(item.workoutId)} lbs
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
                                        <PixelText
                                            fontSize={10}
                                            color="#fff"
                                            style={{
                                                marginBottom: 2,
                                                textAlign: "center",
                                                paddingHorizontal: 0,
                                            }}
                                        >
                                            {repsLabel[i]}
                                        </PixelText>
                                        <TextInput
                                            keyboardType="decimal-pad"
                                            value={weight.toString()}
                                            onChangeText={(v) =>
                                                handleWeightChange(
                                                    item.workoutId,
                                                    i,
                                                    v
                                                )
                                            }
                                            style={styles.weightInput}
                                            placeholder="0"
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
