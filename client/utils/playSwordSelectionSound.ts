import { Audio } from "expo-av";
import { getMuteSounds } from "./getMuteSounds";

// Load + play the sound once
export async function playSwordSelectionSound() {
    try {
        const isMuted = await getMuteSounds();
        if (isMuted) {
            return;
        }
        const { sound } = await Audio.Sound.createAsync(
            require("../assets/sounds/sword_selection_sound.wav")
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
