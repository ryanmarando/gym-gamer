import { Router } from "express";
import * as progressPhotoController from "../controllers/progressPhoto.js";

const router = Router();

router.delete(
    "/deleteAllUserPhotos/:id",
    progressPhotoController.deleteAllUserPhotos
);

router.post(
    "/",
    progressPhotoController.upload.single("photo"),
    progressPhotoController.uploadPhoto
);
router.delete("/:id", progressPhotoController.deleteUserPhoto);

export default router;
