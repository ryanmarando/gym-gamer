import { Router } from "express";
import * as questController from "../controllers/quest.js";
import {
    validateBody,
    QuestUpdateInputSchema,
} from "../middleware/validation.js";

const router = Router();

router.patch(
    "/editQuest/:id",
    validateBody(QuestUpdateInputSchema),
    questController.updateUserQuest
);

router.get("/completeQuest/:id", questController.completeQuest);

export default router;
