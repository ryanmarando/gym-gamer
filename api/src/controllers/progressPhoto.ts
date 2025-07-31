import { NextFunction, Request, Response } from "express";
import { prisma } from "../config.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({ storage: storage });

export const uploadPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = Number(req.body.userId);
    const filePath = String(req.file?.path);

    const uploadedPhoto = await prisma.progressPhoto.create({
        data: {
            userId: userId,
            imagePath: filePath,
        },
    });

    res.status(200).json({
        message: "Photo uploaded!",
        path: filePath,
        photoId: uploadedPhoto.id,
    });
};

export const deleteUserPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const photoId = Number(req.params.id);

        if (!photoId || isNaN(photoId)) {
            res.status(400).json({
                message: "Please provide a valid photoId.",
            });
            return;
        }

        // Get the photo record to find the imagePath
        const photo = await prisma.progressPhoto.findUnique({
            where: { id: photoId },
        });

        if (!photo) {
            res.status(404).json({ message: "Photo not found." });
            return;
        }

        // Delete the file from disk
        const filePath = path.resolve(
            __dirname,
            "../../src/uploads",
            path.basename(photo.imagePath)
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.warn(`File not found on disk: ${filePath}`);
        }

        // Delete the DB record
        await prisma.progressPhoto.delete({
            where: { id: photoId },
        });

        res.status(200).json({
            message: "Progress photo deleted successfully.",
            photoId: photoId,
        });
    } catch (error) {
        console.error("Error deleting progress photo:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const deleteAllUserPhotos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = Number(req.params.id);

        if (!userId || isNaN(userId)) {
            res.status(400).json({
                message: "Please provide a valid userId.",
            });
            return;
        }

        // Find all photos for this user
        const photos = await prisma.progressPhoto.findMany({
            where: { userId: userId },
        });

        if (photos.length === 0) {
            res.status(404).json({ message: "No photos found for this user." });
            return;
        }

        // Delete each photo file from disk
        for (const photo of photos) {
            const filePath = path.resolve(
                __dirname,
                "../../src/uploads",
                path.basename(photo.imagePath)
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            } else {
                console.warn(`File not found on disk: ${filePath}`);
            }
        }

        // Delete all DB records for this user's photos
        await prisma.progressPhoto.deleteMany({
            where: { userId: userId },
        });

        res.status(200).json({
            message: `All progress photos deleted for userId ${userId}.`,
            deletedCount: photos.length,
        });
    } catch (error) {
        console.error("Error deleting all progress photos:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
