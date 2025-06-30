import { Router } from "express";
import * as workoutController from "../controllers/workouts.js";

const router = Router();

router.get("/", workoutController.getAllWorkouts);
router.delete("/", workoutController.deleteAllWorkouts);
router.patch("/saveToUser/:id", workoutController.saveToUser);
router.delete("/deleteFromUser/:id", workoutController.deleteFromUser);

export default router;
