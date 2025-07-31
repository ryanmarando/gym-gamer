import { Router } from "express";
import * as questController from "../controllers/quest.js";
import {
    validateBody,
    QuestUpdateInputSchema,
} from "../middleware/validation.js";
import { isAdminOrUser } from "../middleware/isAdminOrUser.js";

const router = Router();

router.patch(
    "/editQuest/:id",
    isAdminOrUser,
    validateBody(QuestUpdateInputSchema),
    questController.updateUserQuest
);

router.get("/completeQuest/:id", isAdminOrUser, questController.completeQuest);

export default router;
