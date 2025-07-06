import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function authFetch(endpoint: string, options: RequestInit = {}) {
    // Get the stored token
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No auth token found");
    }

    // Merge default headers with any you provide
    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    // Call fetch with combined config
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle non-OK responses if you want
    if (!response.ok) {
        console.error(
            "❌ AuthFetch failed:",
            response.status,
            response.statusText
        );
        throw new Error("API request failed");
    }

    return response.json(); // or return response if you prefer
}
