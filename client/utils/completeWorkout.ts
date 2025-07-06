import { authFetch } from "./authFetch";

export async function completeWorkout(userId: number) {
    try {
        const data = await authFetch(`/workouts/completeWorkout/${userId}`, {
            method: "PATCH",
        });

        console.log("✅ Workout completed:", data);
        return data;
    } catch (error) {
        console.error("❌ Error completing workout:", error);
        throw error;
    }
}
