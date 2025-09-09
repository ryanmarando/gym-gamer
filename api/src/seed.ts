import { prisma } from "./config.js";
import bcrypt from "bcrypt";

async function AssignAdmin() {
    const email = "marandoryan@gmail.com";

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
            process.env.PASSWORD!,
            saltRounds
        );

        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: "Ryan",
                password: {
                    create: {
                        hash: hashedPassword,
                    },
                },
                isAdmin: true,
            },
        });

        console.log(`Admin account ready for ${email}`);
    } catch (error) {
        console.error(`Could not assign admin: ${error}`);
    } finally {
        await prisma.$disconnect();
    }
}

await AssignAdmin();
