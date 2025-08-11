import { Router } from "express";
import * as subController from "../controllers/subscription.js";
import { isAdminOrUser } from "../middleware/isAdminOrUser.js";

const router = Router();

router.post(
    "/createCheckoutSession/:id",
    isAdminOrUser,
    subController.createCheckoutSession
);

router.post("/cancel/:id", isAdminOrUser, subController.cancelSubscription);

export default router;
