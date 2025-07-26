import { Audio } from "expo-av";
import { getMuteSounds } from "./getMuteSounds";
export async function playLoginSound() {
    try {
        const isMuted = await getMuteSounds();
        if (isMuted) {
            return;
        }
        const { sound } = await Audio.Sound.createAsync(
            require("../assets/sounds/pixel_login_sound.wav")
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
