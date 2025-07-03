import { Router } from "express";
import * as workoutController from "../controllers/workouts.js";

const router = Router();

router.get("/", workoutController.getAllWorkouts);
router.delete("/", workoutController.deleteAllWorkouts);
router.delete("/:id", workoutController.deleteWorkoutById);
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

router.patch("/completeWorkout/:id", workoutController.completeWorkout);

router.post("/createCustomWorkout", workoutController.createCustomWorkout);

export default router;
