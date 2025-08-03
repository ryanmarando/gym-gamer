import { Router } from "express";
import * as workoutController from "../controllers/workouts.js";
import {
    validateBody,
    WeightEntrySchema,
    CustomWorkoutInputSchema,
    WorkoutSplitInputSchema,
    CompleteWorkoutInputSchema,
    RepsAndSetsEntrySchema,
} from "../middleware/validation.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { isAdminOrUser } from "../middleware/isAdminOrUser.js";

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
    isAdminOrUser,
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
    isAdminOrUser,
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
    isAdminOrUser,
    validateBody(WorkoutSplitInputSchema),
    workoutController.assignWorkoutSplit
);

router.patch(
    "/saveWorkoutOrder/:id",
    isAdminOrUser,
    workoutController.saveWorkoutOrder
);

router.patch(
    "/addUserWeightLifted/:id",
    isAdminOrUser,
    workoutController.addUserWeightLifted
);
router.patch(
    "/updateRepsAndSets/:id",
    validateBody(RepsAndSetsEntrySchema),
    workoutController.updateUserWorkoutRepsAndSets
);

router.get("/", workoutController.getAllWorkouts);
router.delete("/", isAdmin, workoutController.deleteAllWorkouts);
router.delete("/:id", isAdminOrUser, workoutController.deleteWorkoutById);

export default router;
