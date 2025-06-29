import { Router } from "express";
import * as workoutController from "../controllers/workouts.js";

const router = Router();

router.get("/", workoutController.getAllWorkouts);

export default router;
