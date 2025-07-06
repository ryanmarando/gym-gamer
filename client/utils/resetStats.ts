import { authFetch } from "./authFetch";

export async function resetStats(userId: number) {
    try {
        const data = await authFetch(`/user/resetUserStats/${userId}`, {
            method: "PATCH",
        });

        console.log("✅ Reset stats successful:", data);
        return data;
    } catch (error) {
        console.error("❌ Error reseting user stats:", error);
        throw error;
    }
}
