import { Router } from "express";
import * as authController from "../controllers/auth.js";
//import validateAdminUser from "../middleware/validation.js";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/registerAdmin", authController.createAdminUser);
router.get("/getAllUsers", authController.getAllUsers);

export default router;
