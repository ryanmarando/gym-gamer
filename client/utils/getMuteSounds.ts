import * as SecureStore from "expo-secure-store";

export async function getMuteSounds(): Promise<boolean> {
    try {
        const value = await SecureStore.getItemAsync("muteSounds");

        return value === "true";
    } catch (error) {
        console.error("Error reading muteSounds from AsyncStorage:", error);
        return false; // fallback to not muted
    }
}
