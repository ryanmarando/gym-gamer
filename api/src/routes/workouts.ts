import { Router } from "express";
import * as workoutController from "../controllers/workouts.js";
import {
    validateBody,
    WeightEntrySchema,
    CustomWorkoutInputSchema,
} from "../middleware/validation.js";

const router = Router();

router.get("/", workoutController.getAllWorkouts);
router.delete("/deleteFromUser", workoutController.deleteFromUser);
router.delete("/", workoutController.deleteAllWorkouts);
router.delete("/:id", workoutController.deleteWorkoutById);
router.patch("/saveToUser", workoutController.saveToUser);
router.post(
    "/addWorkoutEntry",
    validateBody(WeightEntrySchema),
    workoutController.addWorkoutEntry
);
router.delete(
    "/deleteWorkoutEntryById/:id",
    workoutController.deleteWorkoutEntryById
);
router.delete(
    "/deleteAllWorkoutEntries",
    workoutController.deleteAllEntriesForUserWorkout
);

router.patch("/completeWorkout/:id", workoutController.completeWorkout);

router.post(
    "/createCustomWorkout",
    validateBody(CustomWorkoutInputSchema),
    workoutController.createCustomWorkout
);

export default router;
