import { Router } from "express";
import * as subscriptionController from "../controllers/subscription.js";
import { isAdminOrUser } from "../middleware/isAdminOrUser.js";

const router = Router();

router.patch(
    "/toggle/:id",
    isAdminOrUser,
    subscriptionController.toggleSubscription
);

export default router;
