import React from "react";
import { View } from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";
import PixelModal from "./PixelModal";
import ConfirmationPixelModal from "./ConfirmationPixelModal";

interface WorkoutHeaderProps {
    selectedDay: any;
    timer: number;
    workoutStarted: boolean;
    formatTime: (seconds: number) => string;
    handleChangeDay: () => void;
    openStartModal: () => void;
    openCompleteModal: () => void;
    showModal: boolean;
    onModalConfirm: () => void;
    modalAction: string | null;
    modalMessage: string;
    setShowModal: (b: boolean) => void;
    showConfirmationModal: boolean;
    setShowConfirmationModal: (b: boolean) => void;
    modalConfirmationTitle: string;
    showConfetti: boolean;
    setSelectedDay: (day: { id: number; name: string } | null) => void;
    finishedWorkout?: boolean;
    setWorkoutFinished: (b: boolean) => void;
    isConfirmingSubscribed: boolean;
    navigation: any;
}

export default function WorkoutHeader({
    selectedDay,
    timer,
    workoutStarted,
    formatTime,
    handleChangeDay,
    openStartModal,
    openCompleteModal,
    showModal,
    onModalConfirm,
    modalAction,
    modalMessage,
    setShowModal,
    showConfirmationModal,
    setShowConfirmationModal,
    modalConfirmationTitle,
    showConfetti,
    setSelectedDay,
    finishedWorkout = false,
    setWorkoutFinished,
    isConfirmingSubscribed,
    navigation,
}: WorkoutHeaderProps) {
    return (
        <View>
            <PixelButton
                text="Change Day"
                onPress={handleChangeDay}
                containerStyle={{ marginBottom: 10 }}
            />
            <PixelText
                fontSize={20}
                color="#ff0"
                style={{ marginBottom: 12, textAlign: "center" }}
            >
                {selectedDay?.name} Day
            </PixelText>
            <PixelText
                fontSize={18}
                color="#0ff"
                style={{ marginBottom: 12, textAlign: "center" }}
            >
                Timer: {formatTime(timer)}
            </PixelText>

            {workoutStarted ? (
                <PixelButton
                    color="#f00"
                    text="Complete Workout"
                    onPress={openCompleteModal}
                    containerStyle={{
                        marginTop: 20,
                        backgroundColor: "#000",
                        borderColor: "#f00",
                    }}
                />
            ) : (
                <PixelButton
                    text="Start Workout"
                    color="#0f0"
                    onPress={openStartModal}
                    containerStyle={{
                        marginTop: 20,

                        borderColor: "#0f0",
                    }}
                />
            )}

            <PixelModal
                visible={showModal}
                onConfirm={onModalConfirm}
                onCancel={() => setShowModal(false)}
                title={modalConfirmationTitle}
                message={modalMessage}
            />

            <ConfirmationPixelModal
                visible={showConfirmationModal}
                onConfirm={() => {
                    setShowConfirmationModal(false);
                    if (finishedWorkout) {
                        setSelectedDay(null);
                        setWorkoutFinished(false);
                        return;
                    }
                    if (isConfirmingSubscribed) {
                        setSelectedDay(null);
                        navigation.navigate("SubscriptionScreen");
                        return;
                    }
                }}
                onCancel={() => {
                    setShowConfirmationModal(false);
                    if (finishedWorkout) {
                        setSelectedDay(null);
                        setWorkoutFinished(false);
                    }
                }}
                title={modalConfirmationTitle}
                message={modalMessage}
                confettiVisible={showConfetti}
            />
        </View>
    );
}
