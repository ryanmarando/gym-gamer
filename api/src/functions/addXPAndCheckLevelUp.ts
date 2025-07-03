import { Prisma } from "@prisma/client";

function getRequiredXp(level: number): number {
    const baseXP = 100;
    const factor = 1.2; // tweak this to make leveling slower/faster
    return Math.floor(baseXP * level * factor);
}

export async function addXpAndCheckLevelUp(
    userId: number,
    xpToAdd: number,
    tx: Prisma.TransactionClient
) {
    let user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, xp: true, level: true, name: true },
    });

    if (!user) {
        throw new Error("User not found");
    }

    let newXp = user.xp + xpToAdd;
    let newLevel = user.level;

    while (true) {
        const requiredXp = getRequiredXp(newLevel);
        if (newXp >= requiredXp) {
            newXp -= requiredXp;
            newLevel += 1;
        } else {
            break;
        }
    }

    const requiredXpForLevel = getRequiredXp(newLevel);
    const progressPercent =
        requiredXpForLevel === 0
            ? 0
            : Math.floor((newXp / requiredXpForLevel) * 100);

    const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
            xp: newXp,
            level: newLevel,
            levelProgress: progressPercent, // ✅ update your new field!
        },
        select: {
            id: true,
            name: true,
            xp: true,
            level: true,
            levelProgress: true,
        },
    });

    return updatedUser;
}
