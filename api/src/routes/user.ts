import { Router } from "express";
import * as userController from "../controllers/user.js";
import {
    validateBody,
    WeightEntrySchema,
    SupportSendEmailSchema,
} from "../middleware/validation.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { isAdminOrUser } from "../middleware/isAdminOrUser.js";

const router = Router();

router.get("/getAllUsers", isAdmin, userController.getAllUsers);
router.get("/getAllUsersOptedIn", isAdmin, userController.getAllUsersOptedIn);
router.delete("/deleteAllUsers", isAdmin, userController.deleteAllUsers);
router.get("/getAllSqueezeUsers", isAdmin, userController.getAllSqueezeUsers);

router.patch(
    "/updateExpoToken/:id",
    isAdminOrUser,
    userController.updateExpoToken
);

router.post(
    "/email",
    validateBody(SupportSendEmailSchema),
    userController.sendEmail
);

router.patch("/opt/:id", isAdminOrUser, userController.opt);

router.delete("/:id", isAdminOrUser, userController.deleteUserById);
router.get("/:id", isAdminOrUser, userController.getUserById);

export default router;
