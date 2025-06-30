import { Router } from "express";
import * as authController from "../controllers/auth.js";
import authenticated from "../middleware/auth.js";
//import validateAdminUser from "../middleware/validation.js";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.patch(
    "/registerAdmin/:id",
    authenticated,
    authController.registerAdminUser
);
router.get("/getAllUsers", authenticated, authController.getAllUsers);
router.delete("/deleteAllUsers", authenticated, authController.deleteAllUsers);

router.get("/getUserWorkouts/:id", authController.getUserWorkouts);

export default router;
