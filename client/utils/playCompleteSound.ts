import { Audio } from "expo-av";

// Load + play the sound once
export async function playCompleteSound() {
    try {
        const { sound } = await Audio.Sound.createAsync(
            require("../assets/sounds/pixel_complete_sound.wav")
        );
        await sound.playAsync();

        // Unload it when done to free resources
        sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;
            if (status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    } catch (error) {
        console.error("Error playing sound:", error);
    }
}
