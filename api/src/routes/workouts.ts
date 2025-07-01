import { Router } from "express";
import * as workoutController from "../controllers/workouts.js";

const router = Router();

router.get("/", workoutController.getAllWorkouts);
router.delete("/", workoutController.deleteAllWorkouts);
router.patch("/saveToUser", workoutController.saveToUser);
router.delete("/deleteFromUser", workoutController.deleteFromUser);
router.post("/addWorkoutEntry", workoutController.addWorkoutEntry);
router.delete(
    "/deleteWorkoutEntryById/:id",
    workoutController.deleteWorkoutEntryById
);
router.delete(
    "/deleteAllWorkoutEntries",
    workoutController.deleteAllEntriesForUserWorkout
);

export default router;
