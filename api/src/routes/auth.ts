import { Router } from "express";
import * as authController from "../controllers/auth.js";
import {
    validateBody,
    RegisterInputSchema,
    LoginInputSchema,
    RequestResetPasswordCodeSchema,
    ResetPasswordSchema,
} from "../middleware/validation.js";

const router = Router();

router.post("/login", validateBody(LoginInputSchema), authController.login);
router.post(
    "/register",
    validateBody(RegisterInputSchema),
    authController.register
);
router.post(
    "/requestResetPasswordCode",
    validateBody(RequestResetPasswordCodeSchema),
    authController.requestResetPasswordCode
);
router.patch(
    "/resetPassword",
    validateBody(ResetPasswordSchema),
    authController.resetPassword
);

export default router;
