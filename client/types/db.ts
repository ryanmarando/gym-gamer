// Users table
export interface User {
    id: number;
    email: string;
    name: string;
    weight_system: "IMPERIAL" | "METRIC";
    level: number;
    level_progress: number;
    xp: number;
    total_weight_lifted: number;
    weekly_weight_lifted: number;
    mute_sounds: boolean;
    expo_push_token?: string | null;
}

// Quests table
export interface Quest {
    id: number;
    user_id: number;
    type: string;
    goal: number;
    goal_date: string;
    name: string;
    base_xp: number;
    updated_at?: string;
    initial_weight?: number;
}

// Workouts table
export interface Workout {
    id: number;
    name: string;
    created_by_user_id?: number | null;
    created_at: string;
    architype: string;
}

// WorkoutSplits table
export interface WorkoutSplit {
    id: number;
    user_id: number;
}

// WorkoutDays table
export interface WorkoutDay {
    id: number;
    day_index: number;
    day_name: string;
    split_id: number;
}

// UserWorkouts join table
export interface UserWorkout {
    user_id: number;
    workout_id: number;
    day_id: number;
    order_index?: number;
    sets: number;
    reps?: string;
    weights_lifted: string;
}

export interface UserWorkoutWithName extends UserWorkout {
    name: string;
    architype: string;
}

// WorkoutEntries table
export interface WorkoutEntry {
    id: number;
    user_id: number;
    workout_id: number;
    weight: number;
    date: string;
}

// Achievements table
export interface Achievement {
    id: number;
    name: string;
    xp: number;
    description?: string;
    goal_amount?: number;
    goal_type?: string;
    weekly_reset: boolean;
    target_value?: number;
    progress: number;
    completed: boolean;
    completed_at?: string;
}

// UserWeightEntries table
export interface UserWeightEntry {
    id: number;
    user_id: number;
    weight: number;
    entered_at: string;
}

// ProgressPhotos table
export interface ProgressPhoto {
    id: number;
    user_id: number;
    uri: string;
    created_at: string;
}
