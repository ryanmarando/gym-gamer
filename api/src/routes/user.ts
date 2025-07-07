import { Router } from "express";
import * as userController from "../controllers/user.js";
import { validateBody, WeightEntrySchema } from "../middleware/validation.js";

const router = Router();

router.get("/getAllUsers", userController.getAllUsers);
router.delete("/deleteAllUsers", userController.deleteAllUsers);

router.get("/getUserWorkouts/:id", userController.getUserWorkouts);
router.get(
    "/getUserWorkoutsByArchitype/:id/:architype",
    userController.getUserWorkoutsByArchitype
);
router.get("/getAllUserPhotos/:id", userController.getAllUserPhotos);

router.get("/getUserAchievements/:id", userController.getUserAchievements);
router.get(
    "/getMostProgressedAchivement/:id",
    userController.getMostProgressedAchivement
);
router.get(
    "/getUserWorkoutWeightEntries/:id",
    userController.getUserWorkoutWeightEntries
);

router.patch("/resetUserStats/:id", userController.resetUserStats);

router.post(
    "/addUserWeightEntry/:id",
    validateBody(WeightEntrySchema),
    userController.addUserWeightEntry
);
router.get(
    "/getAllUserWeightEntries/:id",
    userController.getAllUserWeightEntries
);

router.get("/:id", userController.getUserById);

export default router;
