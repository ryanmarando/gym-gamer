import express from "express";
import cors from "cors";
import logging from "./middleware/logging.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import xss from "./middleware/xss.js";
import authenticated from "./middleware/auth.js";
import { sendEmail } from "./controllers/user.js";

const app = express();
const port = Number(process.env.PORT);

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://admin.localhost:3000",
            "https://www.gymgamer.fit",
            "https://admin.gymgamer.fit",
        ],
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.send("Welcome To The Gym Gamer API!");
});

// Middleware
app.use(express.json());
app.use(logging.logRequest);

// Sanitize
app.use(xss);

// Web Email Support
app.post("/email", sendEmail);

// Login and Register
app.use("/auth", authRouter);

// Authentication
app.use(authenticated);

// Routers
app.use("/user", userRouter);

// Origin Point
app.listen(port, "0.0.0.0", () => {
    console.log(`API listening on :${port}`);
});
