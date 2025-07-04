import { Router } from "express";
import * as authController from "../controllers/auth.js";
import {
    validateBody,
    RegisterInputSchema,
    LoginInputSchema,
} from "../middleware/validation.js";

const router = Router();

router.post("/login", validateBody(LoginInputSchema), authController.login);
router.post(
    "/register",
    validateBody(RegisterInputSchema),
    authController.register
);

export default router;
