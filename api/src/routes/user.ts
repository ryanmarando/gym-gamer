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
router.delete("/deleteAllUsers", isAdmin, userController.deleteAllUsers);

router.get(
    "/getUserWorkouts/:id",
    isAdminOrUser,
    userController.getUserWorkouts
);
router.get(
    "/getUserWorkoutsByArchitype",
    userController.getUserWorkoutsBySplit
);
router.get(
    "/getAllUserPhotos/:id",
    isAdminOrUser,
    userController.getAllUserPhotos
);

router.get(
    "/getUserAchievements/:id",
    isAdminOrUser,
    userController.getUserAchievements
);
router.get("/getUserQuest/:id", isAdminOrUser, userController.getUserQuest);
router.get(
    "/getUserWorkoutWeightEntries/:id",
    isAdminOrUser,
    userController.getUserWorkoutWeightEntries
);

router.patch("/resetUserStats/:id", isAdmin, userController.resetUserStats);

router.post(
    "/addUserWeightEntry/:id",
    isAdminOrUser,
    validateBody(WeightEntrySchema),
    userController.addUserWeightEntry
);
router.get(
    "/getAllUserWeightEntries/:id",
    isAdminOrUser,
    userController.getAllUserWeightEntries
);
router.delete(
    "/deleteLastUserWeightEntry/:id",
    isAdminOrUser,
    userController.deleteLastUserWeightEntry
);
router.delete(
    "/deleteAllUserWeightEntries/:id",
    isAdminOrUser,
    userController.deleteAllUserWeightEntries
);

router.patch(
    "/updateMuteSounds/:id",
    isAdminOrUser,
    userController.updateMuteSounds
);

router.patch(
    "/updateWeightSystem/:id",
    isAdminOrUser,
    userController.updateWeightSystem
);

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

router.delete("/:id", isAdminOrUser, userController.deleteUserById);
router.get("/:id", isAdminOrUser, userController.getUserById);

export default router;
