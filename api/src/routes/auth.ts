import { Router } from "express";
import * as authController from "../controllers/auth.js";
//import validateAdminUser from "../middleware/validation.js";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.patch("/registerAdmin/:id", authController.registerAdminUser);
router.get("/getAllUsers", authController.getAllUsers);
router.delete("/deleteAllUsers", authController.deleteAllUsers);

export default router;
