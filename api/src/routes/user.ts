import { Router } from "express";
import * as userController from "../controllers/user.js";

const router = Router();

router.get("/getAllUsers", userController.getAllUsers);
router.delete("/deleteAllUsers", userController.deleteAllUsers);

router.get("/getUserWorkouts/:id", userController.getUserWorkouts);

export default router;
