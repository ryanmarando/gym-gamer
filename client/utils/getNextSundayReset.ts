export function getNextSundayReset() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

    // Calculate how many days until next Sunday
    let daysUntilSunday = 0;
    if (dayOfWeek === 0) {
        // Today is Sunday - check if before 11:59 PM
        const resetToday = new Date(now);
        resetToday.setHours(23, 59, 0, 0);
        daysUntilSunday = now < resetToday ? 0 : 7; // if past 11:59 PM, next Sunday is 7 days later
    } else {
        daysUntilSunday = 7 - dayOfWeek;
    }

    const nextReset = new Date(now);
    nextReset.setDate(now.getDate() + daysUntilSunday);
    nextReset.setHours(23, 59, 0, 0);

    const diffMs = nextReset.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
        nextReset,
        diffHours,
        diffMinutes,
    };
}
