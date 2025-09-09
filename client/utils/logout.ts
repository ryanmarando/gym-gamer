import * as SecureStore from "expo-secure-store";

export async function logout(
    setIsLoggedIn: (loggedIn: boolean) => void,
    setUserData: (data: any) => void
) {
    try {
        // Delete the token from secure storage
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("loginTimestamp");

        // Reset your app state (set user data to null, loggedIn to false)
        setUserData(null);
        setIsLoggedIn(false);

        console.log("✅ User logged out successfully");
    } catch (error) {
        console.error("❌ Error logging out:", error);
    }
}
