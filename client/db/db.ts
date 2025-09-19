import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy";

let db: any | null = null;

export const getDb = async () => {
    if (!db) {
        throw new Error("Database not initialized. Call openDb() first.");
    }
    return db;
};

export const openDb = async (reset = false) => {
    const dbPath = `${FileSystem.documentDirectory}gymgamer.db`;

    if (reset) {
        // Delete the file if it exists
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        console.log(fileInfo);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(dbPath);
            console.log("✅ Deleted existing DB for reset");
        }
    }

    db = await SQLite.openDatabaseAsync("gymgamer.db");

    if (reset) {
        await db.execAsync(`
      DROP TABLE IF EXISTS progress_photos;
      DROP TABLE IF EXISTS user_weight_entries;
      DROP TABLE IF EXISTS user_achievements;
      DROP TABLE IF EXISTS achievements;
      DROP TABLE IF EXISTS workout_entries;
      DROP TABLE IF EXISTS user_workouts;
      DROP TABLE IF EXISTS workouts;
      DROP TABLE IF EXISTS workout_splits;
      DROP TABLE IF EXISTS workout_days;
      DROP TABLE IF EXISTS quests;
      DROP TABLE IF EXISTS users;
    `);
        console.log("✅ Dropped all tables for reset");
    }

    await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      weight_system TEXT DEFAULT 'IMPERIAL', -- enum (IMPERIAL | METRIC)
      level INTEGER DEFAULT 1,
      level_progress INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      total_weight_lifted REAL DEFAULT 0,
      weekly_weight_lifted REAL DEFAULT 0,
      mute_sounds INTEGER DEFAULT 0, -- bool
      expo_push_token TEXT
    );

    -- Quests
    CREATE TABLE IF NOT EXISTS quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      type TEXT DEFAULT 'GAIN',
      goal INTEGER DEFAULT 10,
      goal_date TEXT DEFAULT CURRENT_TIMESTAMP,
      name TEXT,
      base_xp INTEGER DEFAULT 500,
      updated_at TEXT,
      initial_weight REAL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Workouts
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_by_user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      architype TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workout_splits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workout_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_index INTEGER NOT NULL,
      day_name TEXT NOT NULL,
      split_id INTEGER NOT NULL,
      FOREIGN KEY(split_id) REFERENCES workout_splits(id) ON DELETE CASCADE
    );

    -- UserWorkouts (join table)
    CREATE TABLE IF NOT EXISTS user_workouts (
      user_id INTEGER,
      workout_id INTEGER,
      day_id INTEGER,
      order_index INTEGER,
      sets INTEGER DEFAULT 3,
      reps TEXT DEFAULT '[0,0,0]',
      weights_lifted TEXT DEFAULT '[0,0,0]',
      PRIMARY KEY(user_id, workout_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );

    -- Workout Entries
    CREATE TABLE IF NOT EXISTS workout_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      workout_id INTEGER,
      weight REAL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );

    -- Achievements
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      xp INTEGER,
      description TEXT,
      goal_amount REAL,
      goal_type TEXT,
      weekly_reset INTEGER DEFAULT 0,
      target_value REAL,
      progress REAL DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at TEXT
    );

    -- Weight entries
    CREATE TABLE IF NOT EXISTS user_weight_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      weight REAL,
      entered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

    return db;
};
