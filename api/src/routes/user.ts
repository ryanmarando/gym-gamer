import { Router } from "express";
import * as userController from "../controllers/user.js";

const router = Router();

router.get("/getAllUsers", userController.getAllUsers);
router.delete("/deleteAllUsers", userController.deleteAllUsers);

router.get("/getUserWorkouts/:id", userController.getUserWorkouts);
router.get("/getAllUserPhotos/:id", userController.getAllUserPhotos);

router.get("/getUserAchievements/:id", userController.getUserAchievements);

router.patch("/resetUserStats/:id", userController.resetUserStats);

router.post("/addUserWeightEntry/:id", userController.addUserWeightEntry);
router.get(
    "/getAllUserWeightEntries/:id",
    userController.getAllUserWeightEntries
);

export default router;
