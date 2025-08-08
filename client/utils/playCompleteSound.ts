import { Audio } from "expo-av";
import { getMuteSounds } from "./getMuteSounds";

// Load + play the sound once
export async function playCompleteSound() {
    try {
        const isMuted = await getMuteSounds();
        if (isMuted) {
            return;
        }
        const { sound } = await Audio.Sound.createAsync(
            require("../assets/sounds/pixel_safe_complete_sound.wav")
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
