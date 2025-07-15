import { Router } from "express";
import * as workoutController from "../controllers/workouts.js";
import {
    validateBody,
    WeightEntrySchema,
    CustomWorkoutInputSchema,
    WorkoutSplitInputSchema,
    CompleteWorkoutInputSchema,
} from "../middleware/validation.js";

const router = Router();

router.delete("/deleteFromUser", workoutController.deleteFromUser);
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

router.patch(
    "/completeWorkout/:id",
    validateBody(CompleteWorkoutInputSchema),
    workoutController.completeWorkout
);

router.post(
    "/createCustomWorkout",
    validateBody(CustomWorkoutInputSchema),
    workoutController.createCustomWorkout
);

router.patch(
    "/assignWorkoutSplit/:id",
    validateBody(WorkoutSplitInputSchema),
    workoutController.assignWorkoutSplit
);

router.patch("/addUserWeightLifted/:id", workoutController.addUserWeightLifted);

router.get("/", workoutController.getAllWorkouts);
router.delete("/", workoutController.deleteAllWorkouts);
router.delete("/:id", workoutController.deleteWorkoutById);

export default router;
