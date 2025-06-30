import express from "express";
import logging from "./middleware/logging.js";
import authRouter from "./routes/auth.js";
import workoutRouter from "./routes/workouts.js";
import authenticated from "./middleware/auth.js";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Welcome To The Gym Gamer API!");
});

// Middleware
app.use(express.json());
app.use(logging.logRequest);

// Origin Point
app.listen(port, "0.0.0.0", () => {
    console.log(`API listening on :${port}`);
});

// Login and Register
app.use("/auth", authRouter);

// Authentication
//app.use(authenticated);

// Routers
app.use("/workouts", workoutRouter);
