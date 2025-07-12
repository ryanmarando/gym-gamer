import {
    Modal,
    TextInput,
    ScrollView,
    TouchableOpacity,
    View,
    StyleSheet,
} from "react-native";
import PixelText from "./PixelText";
import PixelButton from "./PixelButton";

export default function WorkoutSplitModal({
    visible,
    onCancel,
    splitName,
    setSplitName,
    splitDays,
    addDay,
    removeDay,
    updateDay,
    onConfirm,
}: {
    visible: boolean;
    onCancel: () => void;
    splitName: string;
    setSplitName: (val: string) => void;
    splitDays: string[];
    addDay: () => void;
    removeDay: () => void;
    updateDay: (index: number, val: string) => void;
    onConfirm: () => void;
}) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <TouchableOpacity
                style={modalStyles.overlay}
                activeOpacity={1}
                onPress={onCancel}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={modalStyles.modalContainer}
                >
                    <PixelText
                        fontSize={14}
                        color="#0ff"
                        style={{ marginBottom: 12 }}
                    >
                        Change Workout Split
                    </PixelText>

                    <View style={{ marginVertical: 10, width: "100%" }}>
                        {splitDays.map((day, i) => (
                            <TextInput
                                key={i}
                                placeholder={`Day ${i + 1} Name`}
                                placeholderTextColor="#555"
                                value={day}
                                onChangeText={(val) => updateDay(i, val)}
                                style={modalStyles.input}
                            />
                        ))}
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <PixelButton
                            text="+"
                            onPress={addDay}
                            containerStyle={{ width: 50 }}
                            disabled={splitDays.length >= 7}
                            color={splitDays.length >= 7 ? "#555" : "#0f0"}
                        />
                        <PixelButton
                            text="-"
                            onPress={removeDay}
                            containerStyle={{ width: 50 }}
                            disabled={splitDays.length <= 3}
                            color={splitDays.length <= 3 ? "#555" : "#f00"}
                        />
                    </View>

                    <View
                        style={{ flexDirection: "row", marginTop: 16, gap: 12 }}
                    >
                        <PixelButton
                            text="Cancel"
                            onPress={onCancel}
                            containerStyle={{ flex: 1, borderColor: "#f00" }}
                            color="#f00"
                        />
                        <PixelButton
                            text="Save"
                            onPress={onConfirm}
                            containerStyle={{ flex: 1, borderColor: "#0f0" }}
                            color="#0f0"
                        />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: "20%",
    },
    modalContainer: {
        backgroundColor: "#111",
        borderColor: "#0ff",
        borderWidth: 3,
        padding: 20,
        borderRadius: 8,
        width: "80%",
    },
    input: {
        backgroundColor: "#222",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 6,
        color: "#0ff",
        fontFamily: "PressStart2P_400Regular",
        fontSize: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        height: 40,
        marginBottom: 10,
    },
});
