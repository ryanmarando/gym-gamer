export function convertKgToLbs(kg: number): number {
    return kg * 2.20462;
}

export function roundToNearestHalf(num: number): number {
    return Math.round(num * 2) / 2;
}
