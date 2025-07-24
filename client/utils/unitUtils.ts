export function convertWeight(
    value: number,
    to: "METRIC" | "IMPERIAL"
): number {
    if (to === "METRIC") {
        return +(value * 0.453592).toFixed(1); // lbs → kg
    } else {
        return +(value / 0.453592).toFixed(1); // kg → lbs
    }
}

export function getWeightUnit(system: "METRIC" | "IMPERIAL"): string {
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

interface Quest {
    name: string;
    type: "GAIN" | "LOSE";
    goal: number;
    goalDate: string | Date;
    baseXP: number;
    initialWeight: number;
}

export function getConvertedQuestFields(
    quest: Quest,
    newSystem: "IMPERIAL" | "METRIC"
) {
    const convertedInitialWeight = convertWeight(
        quest.initialWeight,
        newSystem
    );

    let convertedGoalAmount = convertWeight(quest.goal, newSystem);
    if (convertedGoalAmount === 0) {
        convertedGoalAmount = 1;
    }

    return {
        customType: quest.type,
        customGoalAmount: convertedGoalAmount,
        customDeadline: quest.goalDate,
        initialWeight: convertedInitialWeight,
        weightSystem: newSystem,
    };
}
