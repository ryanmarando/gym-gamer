import { Router } from "express";
import * as workoutController from "../controllers/workouts.js";
import {
    validateBody,
    WeightEntrySchema,
    CustomWorkoutInputSchema,
    WorkoutSplitInputSchema,
    CompleteWorkoutInputSchema,
} from "../middleware/validation.js";
import { isAdmin } from "../middleware/isAdmin.js";

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
    "/deleteAllEntriesForUser",
    workoutController.deleteAllEntriesForUser
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

router.patch("/saveWorkoutOrder/:id", workoutController.saveWorkoutOrder);

router.patch("/addUserWeightLifted/:id", workoutController.addUserWeightLifted);

router.get("/", workoutController.getAllWorkouts);
router.delete("/", isAdmin, workoutController.deleteAllWorkouts);
router.delete("/:id", workoutController.deleteWorkoutById);

export default router;
