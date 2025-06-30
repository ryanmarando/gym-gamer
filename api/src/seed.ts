import { prisma } from "./config.js";

await prisma.workout.create({
    data: { name: "Bench Press" },
});

await prisma.workout.create({
    data: { name: "Bicep Curls" },
});

await prisma.workout.create({
    data: { name: "Squat" },
});
