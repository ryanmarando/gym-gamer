import { Router } from "express";
import * as achievementController from "../controllers/achievement.js";
import {
    validateBody,
    AchievementUpdateInputSchema,
} from "../middleware/validation.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = Router();

router.patch("/saveToUser", achievementController.saveAllAchievementsToUser);
router.post(
    "/updateAchievementProgress",
    validateBody(AchievementUpdateInputSchema),
    achievementController.updateAchievementProgress
);

router.delete(
    "/deleteAllAchievements",
    isAdmin,
    achievementController.deleteAllAchievements
);

router.get(
    "/weeklyReset",
    isAdmin,
    achievementController.weeklyAchivementReset
);

router.get("/", achievementController.getAllAchievements);
router.delete(
    "/",
    isAdmin,
    achievementController.deleteAchievementByIdFromUser
);

export default router;
