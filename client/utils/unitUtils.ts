import { Quest } from "../types/db";

export function convertWeight(value: number, to: string): number {
    if (to === "METRIC") {
        return +(value * 0.453592).toFixed(1); // lbs → kg
    } else {
        return +(value / 0.453592).toFixed(1); // kg → lbs
    }
}

export function getWeightUnit(system: string): string {
    return system === "METRIC" ? "kg" : "lbs";
}

export function getLocalizedAchievementName(
    name: string,
    goalType: string,
    targetValue: number | null,
    weightSystem: "METRIC" | "IMPERIAL"
): string {
    if (goalType === "LIFTINGWEIGHT") {
        const unit = weightSystem === "METRIC" ? "kg" : "lbs";

        // If a number like "10000 lbs" exists in the name, convert it directly
        const replacedName = name.replace(
            /(\d{1,3}(?:,\d{3})*|\d+)(\s*)(lbs|pounds)/gi,
            (match, numStr) => {
                const num = parseFloat(numStr.replace(/,/g, ""));
                const converted =
                    weightSystem === "METRIC"
                        ? Math.round(num * 0.453592)
                        : num;
                return `${converted.toLocaleString()} ${unit}`;
            }
        );

        // Also handle any direct targetValue replacements (like "Deadlift 405 lbs")
        if (targetValue) {
            const convertedValue =
                weightSystem === "METRIC"
                    ? Math.round(targetValue * 0.453592)
                    : targetValue;

            return replacedName.replace(
                /\d+(\.\d+)?\s*(lbs|kg)/i,
                `${convertedValue} ${unit}`
            );
        }

        return replacedName;
    }

    return name;
}

export function roundToNearestHalf(value: number): number {
    return Math.round(value * 2) / 2;
}

export function getConvertedQuestFields(
    quest: Quest,
    newSystem: "IMPERIAL" | "METRIC"
) {
    if (!quest.initial_weight) {
        quest.initial_weight = 30;
    }

    const convertedinitial_weight = roundToNearestHalf(
        convertWeight(quest.initial_weight, newSystem)
    );

    let convertedGoalAmount = roundToNearestHalf(
        convertWeight(quest.goal, newSystem)
    );

    if (convertedGoalAmount === 0) {
        convertedGoalAmount = 1;
    }

    let weightSystem = newSystem;
    if (!weightSystem) {
        weightSystem = "IMPERIAL";
    }

    // 🟢 Always reformat the name, regardless of system
    const formattedType =
        quest.type.charAt(0).toUpperCase() + quest.type.slice(1).toLowerCase();

    const unit = getWeightUnit(weightSystem);

    const dateSuffix =
        quest.type.toUpperCase() === "MAINTAIN"
            ? `through ${new Date(quest.goal_date).toLocaleDateString()}`
            : `by ${new Date(quest.goal_date).toLocaleDateString()}`;

    const name =
        quest.type.toUpperCase() === "MAINTAIN"
            ? `${formattedType} ${convertedinitial_weight} ${unit} ${dateSuffix}`
            : `${formattedType} ${convertedGoalAmount} ${unit} ${dateSuffix}`;

    return {
        customType: quest.type,
        customGoalAmount: convertedGoalAmount,
        customDeadline: quest.goal_date,
        initial_weight: convertedinitial_weight,
        weightSystem,
        name,
    };
}
