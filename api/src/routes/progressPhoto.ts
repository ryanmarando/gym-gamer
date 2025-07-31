import { Router } from "express";
import * as progressPhotoController from "../controllers/progressPhoto.js";
import { isAdminOrUser } from "../middleware/isAdminOrUser.js";
const router = Router();

router.delete(
    "/deleteAllUserPhotos/:id",
    isAdminOrUser,
    progressPhotoController.deleteAllUserPhotos
);

router.post(
    "/",
    progressPhotoController.upload.single("photo"),
    progressPhotoController.uploadPhoto
);
router.delete("/:id", isAdminOrUser, progressPhotoController.deleteUserPhoto);

export default router;
