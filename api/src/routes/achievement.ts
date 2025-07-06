import { Router } from "express";
import * as achievementController from "../controllers/achievement.js";
import {
    validateBody,
    AchievementUpdateInputSchema,
} from "../middleware/validation.js";

const router = Router();

router.patch("/saveToUser", achievementController.saveToUser);
router.post(
    "/updateAchievementProgress",
    validateBody(AchievementUpdateInputSchema),
    achievementController.updateAchievementProgress
);

router.delete(
    "/deleteAllAchievements",
    achievementController.deleteAllAchievements
);

router.get("/weeklyReset", achievementController.weeklyAchivementReset);

router.get("/", achievementController.getAllAchievements);
router.delete("/", achievementController.deleteAchievementByIdFromUser);

export default router;
