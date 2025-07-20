import { Router } from "express";
import * as userController from "../controllers/user.js";
import { validateBody, WeightEntrySchema } from "../middleware/validation.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = Router();

router.get("/getAllUsers", isAdmin, userController.getAllUsers);
router.delete("/deleteAllUsers", isAdmin, userController.deleteAllUsers);

router.get("/getUserWorkouts/:id", userController.getUserWorkouts);
router.get(
    "/getUserWorkoutsByArchitype/:id/:architype",
    userController.getUserWorkoutsByArchitype
);
router.get("/getAllUserPhotos/:id", userController.getAllUserPhotos);

router.get("/getUserAchievements/:id", userController.getUserAchievements);
router.get("/getUserQuest/:id", userController.getUserQuest);
router.get(
    "/getUserWorkoutWeightEntries/:id",
    userController.getUserWorkoutWeightEntries
);

router.patch("/resetUserStats/:id", isAdmin, userController.resetUserStats);

router.post(
    "/addUserWeightEntry/:id",
    validateBody(WeightEntrySchema),
    userController.addUserWeightEntry
);
router.get(
    "/getAllUserWeightEntries/:id",
    userController.getAllUserWeightEntries
);
router.delete(
    "/deleteLastUserWeightEntry/:id",
    userController.deleteLastUserWeightEntry
);
router.delete(
    "/deleteAllUserWeightEntries/:id",
    userController.deleteAllUserWeightEntries
);

router.get("/:id", userController.getUserById);

export default router;
