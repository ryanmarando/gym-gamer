import { Router } from "express";
import * as achievementController from "../controllers/achievement.js";
import {
    validateBody,
    AchievementUpdateInputSchema,
} from "../middleware/validation.js";

const router = Router();

router.get("/", achievementController.getAllAchievements);
router.patch("/saveToUser", achievementController.saveToUser);
router.post(
    "/updateAchievementProgress",
    validateBody(AchievementUpdateInputSchema),
    achievementController.updateAchievementProgress
);

router.delete("/", achievementController.deleteAchievementByIdFromUser);
router.delete(
    "/deleteAllAchievements",
    achievementController.deleteAllAchievements
);

export default router;
