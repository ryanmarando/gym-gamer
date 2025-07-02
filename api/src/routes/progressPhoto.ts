import { Router } from "express";
import * as progressPhotoController from "../controllers/progressPhoto.js";

const router = Router();

router.post(
    "/",
    progressPhotoController.upload.single("photo"),
    progressPhotoController.uploadPhoto
);
router.delete("/:id", progressPhotoController.deleteUserPhoto);
router.delete(
    "/deleteAllUserPhotos/:id",
    progressPhotoController.deleteAllUserPhotos
);

export default router;
