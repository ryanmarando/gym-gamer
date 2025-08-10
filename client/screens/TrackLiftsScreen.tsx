import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
} from "react-native";
import PixelText from "../components/PixelText";
import PixelButton from "../components/PixelButton";
import { authFetch } from "../utils/authFetch";
import * as SecureStore from "expo-secure-store";
import { playDeleteSound } from "../utils/playDeleteSound";
import { playBadMoveSound } from "../utils/playBadMoveSound";
import { LineChart } from "react-native-gifted-charts";
import PixelModal from "../components/PixelModal";

export default function TrackLiftsScreen({ navigation }: any) {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [workoutIdToDelete, setWorkoutIdToDelete] = useState<number | null>(
        null
    );
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState<string>(
        "Your workout entries will be deleted permanently."
    );
    const [modalTitleMessage, setmodalTitleMessage] =
        useState<string>("Are you sure?");
    const [weightSystem, setWeightSystem] = useState<string>("IMPERIAL");

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const userId = await SecureStore.getItemAsync("userId");
            const data = await authFetch(`/user/getUserWorkouts/${userId}`);
            setWorkouts(data.workouts);
            setWeightSystem(data.weightSystem);
            console.log("Weight entries loaded.");
        } catch (err) {
            console.error("Error fetching workouts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWorkoutEntries = async (workoutName: string) => {
        setModalMessage(
            `Your ${workoutName} entries will be deleted permanently.`
        );
        setModalVisible(true);
    };

    const deleteWorkoutEntries = async (workoutId: number) => {
        try {
            const userId = await SecureStore.getItemAsync("userId");
            await authFetch(
                `/workouts/deleteAllWorkoutEntries?userId=${userId}&workoutId=${workoutId}`,
                {
                    method: "DELETE",
                }
            );
            playDeleteSound();
            fetchWorkouts();
        } catch {
            playBadMoveSound();
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    function mapEntriesToChartData(
        entries: { weight: number; date: string }[]
    ) {
        return entries.map((entry) => {
            const value =
                weightSystem === "METRIC"
                    ? Math.round(entry.weight * 0.453592 * 10) / 10
                    : entry.weight;

            return {
                value,
                label: new Date(entry.date).toLocaleDateString(),
                labelTextStyle: {
                    color: "#0ff",
                    fontFamily: "PressStart2P_400Regular",
                    fontSize: 9,
                },
            };
        });
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {workouts.length === 0 ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <PixelText>No workouts found...</PixelText>
                        <PixelButton
                            text="Get Workouts"
                            color="#E67E22"
                            containerStyle={{ marginTop: 12 }}
                            onPress={() =>
                                navigation.navigate("MainTabs", {
                                    screen: "Workout Shop",
                                })
                            }
                        ></PixelButton>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 8 }}>
                        {workouts.map((workout: any) => {
                            const chartData = mapEntriesToChartData(
                                workout.entries
                            );

                            const firstValue =
                                chartData.length > 0 ? chartData[0].value : 0;
                            const yAxisMinValue =
                                firstValue > 0 ? firstValue * 0.95 : 0;

                            return (
                                <View
                                    key={workout.workout.id}
                                    style={styles.card}
                                >
                                    <PixelText fontSize={16} color="#0ff">
                                        {workout.workout.name}
                                    </PixelText>

                                    {chartData.length === 0 && (
                                        <View
                                            style={{
                                                position: "absolute",
                                                marginTop: 100,
                                                zIndex: 1000,
                                            }}
                                        >
                                            <PixelText>
                                                No weight entries to track.
                                            </PixelText>
                                        </View>
                                    )}

                                    <LineChart
                                        data={chartData}
                                        areaChart
                                        curved
                                        height={200}
                                        width={
                                            Dimensions.get("window").width - 56
                                        }
                                        showVerticalLines={false}
                                        spacing={100}
                                        color1="#0ff"
                                        thickness={3}
                                        startFillColor="#0ff"
                                        startOpacity={0.2}
                                        endOpacity={0}
                                        hideRules={false}
                                        rulesColor="rgba(255,255,255,0.2)"
                                        initialSpacing={40}
                                        dataPointsRadius={4}
                                        dataPointsColor="#0ff"
                                        animateOnDataChange
                                        animationDuration={800}
                                        isAnimated
                                        hideYAxisText
                                        textFontSize={13}
                                        textShiftY={-8}
                                        textShiftX={-8}
                                        xAxisIndicesColor="#0ff"
                                        xAxisColor="#0ff"
                                        yAxisColor="#0ff"
                                        showValuesAsDataPointsText
                                        backgroundColor="#111"
                                        yAxisOffset={yAxisMinValue}
                                    />

                                    {chartData.length !== 0 && (
                                        <PixelButton
                                            text="Delete All Entries"
                                            color="#f00"
                                            onPress={() => {
                                                handleDeleteWorkoutEntries(
                                                    workout.workout.name
                                                );
                                                setWorkoutIdToDelete(
                                                    workout.workout.id
                                                );
                                            }}
                                            containerStyle={{ marginTop: 8 }}
                                        />
                                    )}

                                    <PixelModal
                                        visible={modalVisible}
                                        title={modalTitleMessage}
                                        message={modalMessage}
                                        onConfirm={() => {
                                            if (workoutIdToDelete !== null) {
                                                deleteWorkoutEntries(
                                                    workoutIdToDelete
                                                );
                                            }
                                            setModalVisible(false);
                                        }}
                                        onCancel={() => setModalVisible(false)}
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>
                )}
                <View style={styles.bottomButtonContainer}>
                    <PixelButton
                        text="Back to Profile"
                        color="rgba(200, 0, 255, 1)"
                        onPress={() => navigation.goBack()}
                        containerStyle={{ paddingHorizontal: 20 }}
                    />
                </View>
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
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
    },
    card: {
        backgroundColor: "#111",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: "center",
    },
    bottomButtonContainer: {
        padding: 12,
        backgroundColor: "#111",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
});
