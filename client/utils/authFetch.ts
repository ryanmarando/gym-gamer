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

    let res;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
        res = await response.json();
    } else {
        res = await response.text();
    }

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("TOKEN_EXPIRED");
        }
        const message =
            typeof res === "string" ? res : res.message || "API request failed";
        throw new Error(message);
    }

    return res;
}
